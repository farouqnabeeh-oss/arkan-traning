import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

  let [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 15 }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  if (notifications.length === 0) {
    const welcome = await db.notification.create({
      data: {
        userId: user.id,
        title: 'أهلاً بك في منصة أركان التعليمية 🎉',
        body: 'سعداء بانضمامك إلينا! ابدأ بتصفح المسارات التعليمية وحل الألعاب التفاعلية الآن لتطوير مهاراتك البرمجية.',
        link: '/courses',
      }
    });
    notifications = [welcome];
    unreadCount = 1;
  }

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: Request) {
  // تُستخدم داخليًا فقط لتوليد إشعار (تُستدعى من نقاط أخرى بالنظام)
  const { userId, title, body, link } = await request.json();
  if (!userId || !title || !body) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
  const notification = await db.notification.create({ data: { userId, title, body, link } });
  return NextResponse.json({ success: true, notification });
}
