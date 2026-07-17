import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const [courses, games, books] = await Promise.all([
      db.course.findMany({
        where: { isPublished: true },
        select: { id: true, title: true, slug: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      db.game.findMany({
        select: { id: true, name: true, slug: true, category: true },
        orderBy: { name: 'asc' },
        take: 8,
      }),
      db.book.findMany({
        where: { isPublished: true },
        select: { id: true, title: true, slug: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);
    return NextResponse.json({ courses, games, books });
  } catch {
    return NextResponse.json({ courses: [], games: [], books: [] });
  }
}
