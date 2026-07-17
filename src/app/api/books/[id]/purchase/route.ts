import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول أولًا.' }, { status: 401 });

  const { transferNote } = await request.json();
  if (!transferNote || transferNote.trim().length < 3) {
    return NextResponse.json({ error: 'يرجى كتابة اسم المُحوِّل أو رقم العملية للتحقق من التحويل.' }, { status: 400 });
  }

  const book = await db.book.findUnique({ where: { id: params.id } });
  if (!book || !book.isPublished) return NextResponse.json({ error: 'الكتاب غير متاح.' }, { status: 404 });

  const existing = await db.bookPurchase.findUnique({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
  });
  if (existing && existing.status !== 'REJECTED') {
    return NextResponse.json({ error: 'لديك طلب شراء سابق لهذا الكتاب بالفعل.' }, { status: 400 });
  }

  const purchase = await db.bookPurchase.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    update: { status: 'PENDING', proofImageUrl: transferNote.trim(), originalPrice: book.price, finalPrice: book.price, discountPercent: 0, reviewedAt: null },
    create: { userId: user.id, bookId: book.id, status: 'PENDING', proofImageUrl: transferNote.trim(), originalPrice: book.price, finalPrice: book.price },
  });

  return NextResponse.json({ success: true, purchase });
}
