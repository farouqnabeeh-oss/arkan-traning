import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import BookBuilder from '@/components/admin/BookBuilder';

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const book = await db.book.findUnique({ where: { id: params.id } });
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/books" className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع للمكتبة
      </Link>
      <h1 className="text-2xl font-black text-brand-white">تعديل: {book.title}</h1>
      <BookBuilder
        bookId={book.id}
        initialData={{
          title: book.title, slug: book.slug, author: book.author, description: book.description,
          coverImage: book.coverImage || '', price: book.price, pdfFileKey: book.pdfFileKey,
          pagesCount: book.pagesCount || undefined, category: book.category || '', isPublished: book.isPublished,
        } as any}
      />
    </div>
  );
}
