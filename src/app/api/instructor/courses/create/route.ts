import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'غير مصرح. هذا الإجراء متاح للمدربين فقط.' },
        { status: 403 }
      );
    }

    const { title, slug, description, price, level, isPublished } = await request.json();

    if (!title || !slug || !description || price === undefined) {
      return NextResponse.json(
        { error: 'يرجى إدخال جميع الحقول الأساسية المطلوبة.' },
        { status: 400 }
      );
    }

    // Clean up slug
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // Check unique slug
    const existing = await db.course.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'عنوان الـ Slug مستخدم بالفعل لدورة أخرى.' },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        title,
        slug: cleanSlug,
        description,
        price: parseFloat(price),
        level: level || 'ALL_LEVELS',
        isPublished: !!isPublished,
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الدورة التدريبية.' },
      { status: 500 }
    );
  }
}
