import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [], books: [], lessons: [] });
  }

  try {
    const [courses, books, lessons] = await Promise.all([
      db.course.findMany({
        where: { isPublished: true, OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, title: true, slug: true },
        take: 5,
      }),
      db.book.findMany({
        where: { isPublished: true, OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        select: { id: true, title: true, slug: true },
        take: 5,
      }),
      db.lesson.findMany({
        where: { isPublished: true, title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, slug: true, module: { select: { course: { select: { slug: true, isPublished: true } } } } },
        take: 5,
      }),
    ]);

    const visibleLessons = lessons
      .filter((l) => l.module.course.isPublished)
      .map((l) => ({ id: l.id, title: l.title, courseSlug: l.module.course.slug, lessonSlug: l.slug }));

    return NextResponse.json({ courses, books, lessons: visibleLessons });
  } catch {
    return NextResponse.json({ courses: [], books: [], lessons: [] });
  }
}
