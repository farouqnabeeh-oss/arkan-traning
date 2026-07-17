import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // البحث عن الكتاب بالمعرّف (ID) أو بالرابط اللطيف (Slug) لتجنب تعارض المسارات في Next.js
  const book = await db.book.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id }
      ]
    }
  });

  if (!book || !book.isPublished) return NextResponse.json({ error: 'الكتاب غير موجود.' }, { status: 404 });

  const user = await getSessionUser();
  let purchase = null;
  if (user) {
    purchase = await db.bookPurchase.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
    });
  }

  const { pdfFileKey, ...safeBook } = book;
  return NextResponse.json({
    book: safeBook,
    hasAccess: purchase?.status === 'APPROVED',
    purchaseStatus: purchase?.status || null,
    pdfUrl: purchase?.status === 'APPROVED' ? pdfFileKey : null,
  });
}
