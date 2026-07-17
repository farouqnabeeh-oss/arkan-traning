import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';
import { sendVerificationCodeEmail } from '@/lib/email';
import { grantAchievement } from '@/lib/achievements';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  fingerprint: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(`register:${clientKey}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'عدد كبير من محاولات التسجيل، يرجى المحاولة لاحقًا.' }, { status: 429 });
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, fingerprint = 'unknown-device', referralCode } = result.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    
    // Check if we should make them instructor based on email or if it's the first user.
    // In production, the first user is typically the instructor, or we check a specific email domain.
    // Let's make instructor@arkan.edu automatically an instructor.
    const isInstructor = email.toLowerCase() === 'instructor@arkan.edu';
    const role = isInstructor ? 'INSTRUCTOR' : 'STUDENT';

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
      },
    });

    // نظام الإحالة: مكافأة XP للطرفين عند التسجيل بكود صحيح
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (referrer && referrer.id !== user.id) {
        await db.user.update({ where: { id: user.id }, data: { referredById: referrer.id, xp: { increment: 50 } } });
        await db.user.update({ where: { id: referrer.id }, data: { xp: { increment: 100 } } });
        await grantAchievement(referrer.id, 'FIRST_REFERRAL');
        await db.notification.create({
          data: {
            userId: referrer.id,
            title: 'مكافأة إحالة! 🎉',
            body: `${name} انضم للمنصة عبر رابط دعوتك، وحصلت على 100 نقطة خبرة.`,
          },
        });
      }
    }

    // إرسال رمز تحقق للبريد الإلكتروني بدل تسجيل الدخول الفوري
    const code = generateCode();
    await db.emailVerificationCode.create({
      data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    const emailResult = await sendVerificationCodeEmail(user.email, user.name, code);
    if (!emailResult.success) {
      console.error('[register] فشل إرسال رمز التحقق:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      needsVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
