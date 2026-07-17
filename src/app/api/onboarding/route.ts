import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { level, interest } = await request.json();

  await db.user.update({ where: { id: user.id }, data: { onboardingCompleted: true } });

  // اقتراح دورات مطابقة للمستوى والاهتمام المُختارين
  const recommended = await db.course.findMany({
    where: {
      isPublished: true,
      ...(level && level !== 'ALL' ? { level } : {}),
      ...(interest && interest !== 'ALL' ? { category: { contains: interest, mode: 'insensitive' } } : {}),
    },
    take: 3,
    select: { id: true, title: true, slug: true, price: true },
  });

  // لو ما لقينا نتائج مطابقة تمامًا، نرجع أحدث الدورات المنشورة كبديل
  const fallback = recommended.length > 0 ? recommended : await db.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, price: true },
  });

  return NextResponse.json({ success: true, recommended: fallback });
}
