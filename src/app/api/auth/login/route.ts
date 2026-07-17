import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { comparePassword, createSession } from '@/lib/auth';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';


const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  fingerprint: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(`login:${clientKey}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'عدد كبير من محاولات الدخول، يرجى المحاولة لاحقًا.' }, { status: 429 });
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, fingerprint = 'unknown-device' } = result.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordMatch = await comparePassword(password, user.passwordHash);

    if (!isPasswordMatch) {
      // Log login event failure
      await db.loginEvent.create({
        data: {
          userId: user.id,
          fingerprint,
          status: 'FAILED',
        },
      });

      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'يرجى تأكيد بريدك الإلكتروني أولًا.', needsVerification: true, email: user.email },
        { status: 403 }
      );
    }

    // Create session (signs token, saves to DB, sets cookie, handles single-session rules)
    await createSession(user.id, user.role, fingerprint);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
