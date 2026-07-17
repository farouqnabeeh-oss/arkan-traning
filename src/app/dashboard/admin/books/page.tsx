import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, Library, Clock } from 'lucide-react';
import BookRowActions from '@/components/admin/BookRowActions';
import PurchaseRequestsPanel from '@/components/admin/PurchaseRequestsPanel';

export default async function AdminBooksPage() {
  const [books, pendingPurchases] = await Promise.all([
    db.book.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { purchases: true } } } }),
    db.bookPurchase.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true, email: true } }, book: { select: { title: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-white">المكتبة الرقمية</h1>
          <p className="text-brand-silver-dim mt-1 text-sm">{books.length} كتاب · {pendingPurchases.length} طلب شراء بانتظار المراجعة</p>
        </div>
        <Link href="/dashboard/admin/books/new" className="royal-gradient text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={18} /> كتاب جديد
        </Link>
      </div>

      {pendingPurchases.length > 0 && (
        <div>
          <h2 className="font-bold text-brand-white mb-3 flex items-center gap-2"><Clock size={18} className="text-amber-400" /> طلبات شراء بانتظار الموافقة</h2>
          <PurchaseRequestsPanel purchases={JSON.parse(JSON.stringify(pendingPurchases))} />
        </div>
      )}

      {books.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <Library size={40} className="mx-auto text-brand-silver-dim mb-4" />
          <p className="text-brand-silver-dim">لا يوجد كتب بعد.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {books.map((book) => (
            <div key={book.id} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-brand-white truncate">{book.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${book.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-brand-silver-dim'}`}>
                  {book.isPublished ? 'منشور' : 'مسودة'}
                </span>
              </div>
              <p className="text-xs text-brand-silver-dim">{book.author} · {book._count.purchases} عملية شراء</p>
              <p className="text-sm text-brand-royal-light font-bold mt-2">{book.price} ₪</p>
              <BookRowActions bookId={book.id} isPublished={book.isPublished} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
