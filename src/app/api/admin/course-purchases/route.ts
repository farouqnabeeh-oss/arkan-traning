import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const admin = await getSessionUser();
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const requests = await db.coursePurchaseRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true, price: true } },
    },
  });

  return NextResponse.json({ requests });
}
