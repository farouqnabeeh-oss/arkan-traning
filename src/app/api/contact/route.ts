import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isRateLimited, getClientKey } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(`contact:${clientKey}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'عدد كبير من المحاولات، يرجى المحاولة لاحقًا بعد قليل.' }, { status: 429 });
  }

  const { name, email, phone, subject, message } = await request.json();

  const errors: Record<string, string> = {};
  if (!name || name.trim().length < 2) errors.name = 'يرجى إدخال اسم صحيح (حرفين على الأقل).';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  if (!subject || subject.trim().length < 3) errors.subject = 'يرجى إدخال موضوع الرسالة.';
  if (!message || message.trim().length < 10) errors.message = 'الرسالة قصيرة جدًا، يرجى كتابة 10 أحرف على الأقل.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول بشكل صحيح.', fieldErrors: errors }, { status: 400 });
  }

  const saved = await db.contactMessage.create({
    data: { name: name.trim(), email: email.trim(), phone: phone?.trim(), subject: subject.trim(), message: message.trim() },
  });

  // Forward to farugn9@gmail.com
  await sendEmail({
    to: 'farugn9@gmail.com',
    subject: `رسالة جديدة من نموذج الاتصال: ${subject.trim()}`,
    html: `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; background: #0F1830; color: #F2F5FA; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(59,91,219,0.3);">
        <h2 style="color: #7C93F0; border-bottom: 1px solid rgba(59,91,219,0.2); padding-bottom: 12px; margin-top: 0;">رسالة تواصل جديدة من الموقع</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: rgba(242,245,250,0.5); width: 120px;"><strong>المرسل:</strong></td>
            <td style="padding: 8px 0; color: #F2F5FA;">${name.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(242,245,250,0.5);"><strong>البريد الإلكتروني:</strong></td>
            <td style="padding: 8px 0; color: #F2F5FA;"><a href="mailto:${email.trim()}" style="color: #7C93F0; text-decoration: none;">${email.trim()}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(242,245,250,0.5);"><strong>رقم الجوال:</strong></td>
            <td style="padding: 8px 0; color: #F2F5FA;" dir="ltr" style="text-align: right;">${phone?.trim() || 'لم يتم إدخاله'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(242,245,250,0.5);"><strong>الموضوع:</strong></td>
            <td style="padding: 8px 0; color: #F2F5FA;">${subject.trim()}</td>
          </tr>
        </table>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; line-height: 1.8; color: rgba(242,245,250,0.85); font-size: 15px; white-space: pre-wrap;">${message.trim()}</div>
      </div>
    `
  }).catch((err) => {
    console.error('[SMTP CONTACT ERROR]', err);
  });

  return NextResponse.json({ success: true, id: saved.id });
}
