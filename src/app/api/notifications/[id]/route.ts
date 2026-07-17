import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const notification = await db.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.userId !== user.id) {
    return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  }

  await db.notification.update({ where: { id: params.id }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}
