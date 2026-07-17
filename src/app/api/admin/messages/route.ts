import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET() {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ messages });
}
