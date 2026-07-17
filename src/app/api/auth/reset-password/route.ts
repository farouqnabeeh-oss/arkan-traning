import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' },
        { status: 400 }
      );
    }

    // 1. Find token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'الرابط غير صالح أو تم استخدامه مسبقاً.' },
        { status: 400 }
      );
    }

    // 2. Check if token expired
    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور.' },
        { status: 400 }
      );
    }

    // 3. Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Update user password
    await db.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // 5. Delete token
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}
