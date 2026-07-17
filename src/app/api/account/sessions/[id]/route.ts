import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });

  const session = await db.deviceSession.findUnique({ where: { id: params.id } });
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ error: 'الجلسة غير موجودة.' }, { status: 404 });
  }

  await db.deviceSession.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
