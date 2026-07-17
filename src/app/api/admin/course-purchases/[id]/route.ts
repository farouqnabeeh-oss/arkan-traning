import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import crypto from 'crypto';
import { logAdminAction } from '@/lib/auditLog';
import { sendEmail } from '@/lib/email';

function generateAccessCode() {
  return `ARK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getSessionUser();
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { status } = await request.json();
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'حالة غير صحيحة.' }, { status: 400 });
  }

  const purchaseRequest = await db.coursePurchaseRequest.findUnique({
    where: { id: params.id },
    include: { user: true, course: { select: { title: true } } },
  });
  if (!purchaseRequest) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });

  let accessCode: string | null = null;

  if (status === 'APPROVED') {
    accessCode = generateAccessCode();

    // ننشئ قسيمة مستخدمة فورًا كسجل رسمي للرمز، ونسجّل الطالب مباشرة بالدورة
    const voucher = await db.voucher.create({
      data: {
        code: accessCode,
        courseId: purchaseRequest.courseId,
        discountPercent: 100,
        isUsed: true,
        usedAt: new Date(),
        createdById: admin.id,
      },
    });

    await db.enrollment.upsert({
      where: { userId_courseId: { userId: purchaseRequest.userId, courseId: purchaseRequest.courseId } },
      update: {},
      create: { userId: purchaseRequest.userId, courseId: purchaseRequest.courseId, voucherId: voucher.id },
    });

    await db.notification.create({
      data: {
        userId: purchaseRequest.userId,
        title: 'تم تفعيل دورتك! 🎉',
        body: `رمز وصولك الخاص لدورة "${purchaseRequest.course.title}" هو: ${accessCode}`,
        link: `/dashboard`,
      },
    });

    await sendEmail({
      to: purchaseRequest.user.email,
      subject: `رمز الوصول لدورتك: ${purchaseRequest.course.title}`,
      html: `
        <div dir="rtl" style="font-family: sans-serif; text-align:right;">
          <h2>مبروك ${purchaseRequest.user.name}! 🎉</h2>
          <p>تم تفعيل اشتراكك بدورة <strong>${purchaseRequest.course.title}</strong> بنجاح.</p>
          <p>رمز الوصول الخاص بك لهذه الدورة (احتفظ به):</p>
          <div style="background:#1F2E63; color:#fff; font-size:24px; font-weight:900; letter-spacing:6px; padding:14px 20px; border-radius:10px; display:inline-block;">${accessCode}</div>
          <p style="color:#888; font-size:13px;">تقدر تدخل على الدورة مباشرة من لوحتك، الرمز محفوظ لك كإثبات اشتراك دائم.</p>
        </div>
      `,
    }).catch(() => {});
  }

  await db.coursePurchaseRequest.update({
    where: { id: params.id },
    data: { status, accessCode, reviewedAt: new Date() },
  });

  await logAdminAction(
    admin,
    status === 'APPROVED' ? 'APPROVE_COURSE_PURCHASE' : 'REJECT_COURSE_PURCHASE',
    'CoursePurchaseRequest',
    params.id,
    purchaseRequest.course.title
  );

  if (status === 'REJECTED') {
    await db.notification.create({
      data: {
        userId: purchaseRequest.userId,
        title: 'بخصوص طلب التسجيل بالدورة',
        body: `للأسف تم رفض طلب اشتراكك بدورة "${purchaseRequest.course.title}"، تواصل معنا لمزيد من التفاصيل.`,
        link: '/contact',
      },
    });
  }

  return NextResponse.json({ success: true, accessCode });
}
