import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import BookBuilder from '@/components/admin/BookBuilder';

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/books" className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع للمكتبة
      </Link>
      <h1 className="text-2xl font-black text-brand-white">إضافة كتاب جديد</h1>
      <BookBuilder />
    </div>
  );
}
