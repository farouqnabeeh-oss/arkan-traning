import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const purchases = await db.bookPurchase.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, price: true } },
    },
  });

  return NextResponse.json({ purchases });
}

// منح كتاب مباشرة لطالب من لوحة الأدمن (بدون المرور بخطوات الدفع)
export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { userId, bookId, discountPercent } = await request.json();
  if (!userId || !bookId) {
    return NextResponse.json({ error: 'يرجى تحديد الطالب والكتاب.' }, { status: 400 });
  }

  const book = await db.book.findUnique({ where: { id: bookId } });
  if (!book) return NextResponse.json({ error: 'الكتاب غير موجود.' }, { status: 404 });

  const discount = Math.min(100, Math.max(0, discountPercent || 0));
  const finalPrice = book.price * (1 - discount / 100);

  const purchase = await db.bookPurchase.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: {
      status: 'APPROVED', discountPercent: discount, finalPrice,
      grantedById: admin.id, reviewedAt: new Date(),
    },
    create: {
      userId, bookId, status: 'APPROVED', originalPrice: book.price,
      discountPercent: discount, finalPrice, grantedById: admin.id, reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, purchase });
}
