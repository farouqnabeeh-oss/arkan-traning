// نظام إيميل مركزي موحّد — Gmail SMTP (مجاني بالكامل، بدون الحاجة لأي دومين)
// ─────────────────────────────────────────────────────────────────
// خطوات التفعيل (مرة واحدة بس):
// 1) فعّل "التحقق بخطوتين" على حساب Gmail تبعك من: myaccount.google.com/security
// 2) روح لـ myaccount.google.com/apppasswords وولّد "App Password" جديد (اسمه مثلاً "Arkan")
// 3) بالـ .env حط:
//    SMTP_USER="بريدك@gmail.com"
//    SMTP_PASSWORD="الـ App Password اللي طلع (16 حرف بدون مسافات)"
//    EMAIL_FROM="أركان <بريدك@gmail.com>"
// مهم: لازم App Password تحديدًا، مش باسورد الجيميل العادي — هذا بالضبط سبب فشل الإرسال سابقًا.
// حد الإرسال المجاني لجيميل: ~500 إيميل باليوم، أكتر من كافي لحجمك الحالي.

import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!t || !from) {
    console.warn('[EMAIL] SMTP_USER/SMTP_PASSWORD غير مضبوطين بملف .env — تم تجاهل الإرسال.');
    return { success: false, error: 'missing_smtp_config' };
  }

  try {
    await t.sendMail({ from, to, subject, html });
    return { success: true };
  } catch (err: any) {
    console.error('[EMAIL] فشل الإرسال عبر Gmail SMTP:', err?.message || err);
    if (err?.message?.includes('Invalid login')) {
      console.error('[EMAIL] السبب الأرجح: تستخدم باسورد Gmail العادي بدل App Password. راجع التعليمات بأعلى هذا الملف.');
    }
    return { success: false, error: err?.message || 'send_failed' };
  }
}

/* ─── قالب أساسي موحّد بهوية أركان (أزرق ملكي / فضي) ─────────────────── */
function emailShell(title: string, bodyHtml: string, ctaText?: string, ctaUrl?: string): string {
  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; text-align: right; max-width: 600px; margin: 0 auto; background: #0F1830; color: #F2F5FA; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1F2E63, #070B14); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(59,91,219,0.3);">
        <h1 style="background: linear-gradient(90deg,#C7D0DE,#7C93F0,#C7D0DE); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; font-size: 28px; letter-spacing: 2px;">أركان</h1>
        <p style="color: rgba(242,245,250,0.5); margin: 8px 0 0; font-size: 13px;">المنصة التعليمية الرائدة</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #F2F5FA; font-size: 21px; margin: 0 0 15px;">${title}</h2>
        <div style="color: rgba(242,245,250,0.7); line-height: 1.9; font-size: 15px;">${bodyHtml}</div>
        ${ctaText && ctaUrl ? `
        <div style="text-align: center; margin: 35px 0;">
          <a href="${ctaUrl}" style="background: linear-gradient(135deg, #7C93F0, #3B5BDB); color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block;">${ctaText}</a>
        </div>` : ''}
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 20px 30px; text-align: center;">
        <p style="color: rgba(242,245,250,0.3); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} منصة أركان التعليمية. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  `;
}

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationCodeEmail(to: string, name: string, code: string) {
  return sendEmail({
    to,
    subject: `رمز التحقق: ${code} — منصة أركان`,
    html: emailShell(
      `مرحبًا ${name}،`,
      `<p>رمز التحقق من بريدك الإلكتروني هو:</p>
       <div style="text-align:center; margin: 25px 0;">
         <span style="display:inline-block; background:#1F2E63; color:#F2F5FA; font-size:32px; font-weight:900; letter-spacing:10px; padding:16px 28px; border-radius:12px;">${code}</span>
       </div>
       <p style="color: rgba(242,245,250,0.4); font-size: 13px;">الرمز صالح لمدة 10 دقائق فقط. لو ما طلبت هذا الرمز، تجاهل الرسالة.</p>`
    ),
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: 'أهلًا فيك بمنصة أركان 🎉',
    html: emailShell(
      `مرحبًا ${name}،`,
      `<p>سعداء جدًا بانضمامك لمنصة أركان! دلوقتي تقدر تستكشف الدورات والألعاب البرمجية والمكتبة الرقمية، وتبدأ رحلتك التعليمية.</p>`,
      'استكشف الدورات الآن',
      `${appUrl()}/courses`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: 'إعادة تعيين كلمة المرور - منصة أركان',
    html: emailShell(
      `مرحبًا ${name}،`,
      `<p>تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك. الرابط صالح لمدة ساعة واحدة فقط.</p><p style="color: rgba(242,245,250,0.4); font-size: 13px;">إذا لم تطلب ذلك، تجاهل هذه الرسالة — حسابك آمن.</p>`,
      'إعادة تعيين كلمة المرور',
      resetUrl
    ),
  });
}

export async function sendBookPurchaseDecisionEmail(to: string, name: string, bookTitle: string, approved: boolean) {
  return sendEmail({
    to,
    subject: approved ? 'تمت الموافقة على طلبك! 📚' : 'بخصوص طلب شراء الكتاب',
    html: emailShell(
      `مرحبًا ${name}،`,
      approved
        ? `<p>تمت الموافقة على طلب شراء كتاب "<strong>${bookTitle}</strong>". يمكنك الآن تحميله من مكتبتك.</p>`
        : `<p>للأسف تم رفض طلب شراء كتاب "<strong>${bookTitle}</strong>". تواصل معنا لمزيد من التفاصيل.</p>`,
      approved ? 'اذهب للمكتبة' : 'تواصل معنا',
      approved ? `${appUrl()}/library` : `${appUrl()}/contact`
    ),
  });
}

export async function sendCertificateReadyEmail(to: string, name: string, courseTitle: string, verificationId: string) {
  return sendEmail({
    to,
    subject: 'مبروك! شهادتك جاهزة 🏆',
    html: emailShell(
      `مبروك ${name}!`,
      `<p>أتممت بنجاح جميع متطلبات دورة "<strong>${courseTitle}</strong>" واجتزت الامتحان النهائي. شهادتك الموثقة جاهزة الآن.</p>`,
      'عرض شهادتي',
      `${appUrl()}/certificates/${verificationId}`
    ),
  });
}

export async function sendInactivityReminderEmail(to: string, name: string, courseTitle: string) {
  return sendEmail({
    to,
    subject: `اشتقنالك يا ${name}! 👋`,
    html: emailShell(
      `وين اختفيت يا ${name}؟`,
      `<p>لاحظنا إنك ما كملت دورة "<strong>${courseTitle}</strong>" من فترة. رجعتك بسيطة — كمّل من حيث وقفت!</p>`,
      'أكمل التعلم',
      `${appUrl()}/dashboard`
    ),
  });
}
