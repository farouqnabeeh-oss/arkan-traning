import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}
