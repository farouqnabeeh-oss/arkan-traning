import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(`forgot-password:${clientKey}`, 3, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'عدد كبير من المحاولات، حاول لاحقًا.' }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      // حماية من تخمين وجود إيميلات بالنظام
      return NextResponse.json({ success: true });
    }

    await db.passwordResetToken.deleteMany({ where: { email: user.email } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await db.passwordResetToken.create({ data: { email: user.email, token, expiresAt } });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const result = await sendPasswordResetEmail(user.email, user.name, resetUrl);
    if (!result.success) {
      console.log(`[DEV FALLBACK] رابط إعادة التعيين (لم يصل الإيميل): ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب.' }, { status: 500 });
  }
}
