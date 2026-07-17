import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });

  const sessions = await db.deviceSession.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  const loginEvents = await db.loginEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ sessions, loginEvents });
}
