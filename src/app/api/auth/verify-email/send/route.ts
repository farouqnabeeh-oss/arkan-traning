import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationCodeEmail } from '@/lib/email';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 أرقام
}

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني.' }, { status: 400 });

  const clientKey = getClientKey(request);
  if (isRateLimited(`verify-email-send:${clientKey}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'عدد كبير من المحاولات، انتظر شوي وحاول مرة ثانية.' }, { status: 429 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: 'لا يوجد حساب بهذا البريد.' }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: 'هذا البريد موثّق بالفعل.' }, { status: 400 });

  // إبطال أي رموز سابقة غير مستخدمة لنفس الإيميل
  await db.emailVerificationCode.updateMany({
    where: { email: user.email, used: false },
    data: { used: true },
  });

  const code = generateCode();
  await db.emailVerificationCode.create({
    data: { email: user.email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const result = await sendVerificationCodeEmail(user.email, user.name, code);
  if (!result.success) {
    console.error('[verify-email] فشل إرسال رمز التحقق:', result.error);
    return NextResponse.json({ error: 'تعذّر إرسال رمز التحقق حاليًا، حاول لاحقًا.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
