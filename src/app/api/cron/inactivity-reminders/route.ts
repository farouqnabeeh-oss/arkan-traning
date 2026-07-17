import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendInactivityReminderEmail } from '@/lib/email';

// يُستدعى دوريًا (مرة أسبوعيًا مثلًا) عبر خدمة Cron خارجية مجانية (مثل cron-job.org)
// محمي بمفتاح سري بسيط عبر رابط الاستدعاء لمنع أي حد يشغّله عشوائيًا
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // طلاب متوقفين: آخر نشاط بين 7 و14 يوم، وعندهم دورة غير مكتملة
  const staleEnrollments = await db.enrollment.findMany({
    where: {
      isCompleted: false,
      updatedAt: { lte: sevenDaysAgo, gte: fourteenDaysAgo },
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    take: 100,
  });

  let sent = 0;
  for (const enrollment of staleEnrollments) {
    const result = await sendInactivityReminderEmail(enrollment.user.email, enrollment.user.name, enrollment.course.title);
    if (result.success) sent++;
  }

  return NextResponse.json({ success: true, checked: staleEnrollments.length, sent });
}
