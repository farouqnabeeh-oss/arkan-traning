import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/auditLog';
import { sendBookPurchaseDecisionEmail } from '@/lib/email';
import { grantAchievement } from '@/lib/achievements';

export const dynamic = 'force-dynamic';


// الموافقة/الرفض على طلب شراء كتاب، مع إمكانية تطبيق خصم
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { status, discountPercent } = await request.json();
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'حالة غير صحيحة.' }, { status: 400 });
  }

  const existing = await db.bookPurchase.findUnique({
    where: { id: params.id },
    include: { book: { select: { title: true } }, user: { select: { name: true, email: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'الطلب غير موجود.' }, { status: 404 });

  const discount = discountPercent !== undefined ? Math.min(100, Math.max(0, discountPercent)) : existing.discountPercent;
  const finalPrice = existing.originalPrice * (1 - discount / 100);

  const purchase = await db.bookPurchase.update({
    where: { id: params.id },
    data: { status, discountPercent: discount, finalPrice, reviewedAt: new Date() },
  });

  await logAdminAction(admin, status === 'APPROVED' ? 'APPROVE_PURCHASE' : 'REJECT_PURCHASE', 'BookPurchase', params.id, existing.book.title);

  await db.notification.create({
    data: {
      userId: existing.userId,
      title: status === 'APPROVED' ? 'تمت الموافقة على طلبك! 📚' : 'تم رفض طلب الشراء',
      body: status === 'APPROVED' ? `يمكنك الآن تحميل كتاب "${existing.book.title}".` : `للأسف تم رفض طلب شراء "${existing.book.title}"، تواصل معنا لمزيد من التفاصيل.`,
      link: status === 'APPROVED' ? '/library' : '/contact',
    },
  });

  sendBookPurchaseDecisionEmail(existing.user.email, existing.user.name, existing.book.title, status === 'APPROVED').catch(() => {});
  if (status === 'APPROVED') await grantAchievement(existing.userId, 'FIRST_BOOK');

  return NextResponse.json({ success: true, purchase });
}
