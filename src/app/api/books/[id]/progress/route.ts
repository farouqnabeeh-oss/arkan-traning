import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { readProgress, markFinished } = await request.json();

  const purchase = await db.bookPurchase.findUnique({
    where: { userId_bookId: { userId: user.id, bookId: params.id } },
  });
  if (!purchase || purchase.status !== 'APPROVED') {
    return NextResponse.json({ error: 'لا تملك وصولًا لهذا الكتاب.' }, { status: 403 });
  }

  const nextProgress = markFinished ? 100 : Math.max(purchase.readProgress, Math.min(99, readProgress || 0));

  await db.bookPurchase.update({
    where: { id: purchase.id },
    data: { readProgress: nextProgress },
  });

  return NextResponse.json({ success: true, readProgress: nextProgress });
}
