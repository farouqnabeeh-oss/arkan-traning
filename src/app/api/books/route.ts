import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const books = await db.book.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, author: true, description: true,
        coverImage: true, price: true, pagesCount: true, category: true,
      },
    });
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ books: [] });
  }
}
