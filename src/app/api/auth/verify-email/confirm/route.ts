import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  const { email, code, fingerprint = 'unknown-device' } = await request.json();
  if (!email || !code) return NextResponse.json({ error: 'يرجى إدخال الرمز.' }, { status: 400 });

  const clientKey = getClientKey(request);
  if (isRateLimited(`verify-email-confirm:${clientKey}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'عدد كبير من المحاولات الخاطئة، انتظر شوي.' }, { status: 429 });
  }

  const record = await db.emailVerificationCode.findFirst({
    where: { email: email.toLowerCase(), code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return NextResponse.json({ error: 'الرمز غير صحيح أو انتهت صلاحيته.' }, { status: 400 });
  }

  await db.emailVerificationCode.update({ where: { id: record.id }, data: { used: true } });

  const user = await db.user.update({
    where: { email: email.toLowerCase() },
    data: { emailVerified: true },
  });

  await createSession(user.id, user.role, fingerprint);
  sendWelcomeEmail(user.email, user.name).catch(() => {});

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
