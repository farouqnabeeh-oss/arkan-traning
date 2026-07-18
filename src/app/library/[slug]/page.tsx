import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import BookPurchaseButton from '@/components/BookPurchaseButton';
import BookReader from '@/components/BookReader';
import { FileText, ChevronLeft, ShieldCheck, BookOpenCheck, User2, Package } from 'lucide-react';

import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const book = await db.book.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, coverImage: true },
  });
  if (!book) return { title: 'الكتاب غير موجود | أركان' };

  return {
    title: `${book.title} | مكتبة أركان`,
    description: book.description.slice(0, 160),
    openGraph: { title: book.title, description: book.description.slice(0, 160), images: book.coverImage ? [book.coverImage] : undefined },
  };
}

export default async function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = await db.book.findUnique({
    where: { slug: params.slug },
    include: { bundleCourse: { select: { id: true, title: true, slug: true, price: true } } },
  });
  if (!book || !book.isPublished) notFound();

  const user = await getSessionUser();
  let purchase = null;
  if (user) {
    purchase = await db.bookPurchase.findUnique({ where: { userId_bookId: { userId: user.id, bookId: book.id } } });
  }
  const hasAccess = purchase?.status === 'APPROVED';

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />

      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm font-tajawal text-brand-white/50 mb-8">
            <Link href="/" className="hover:text-brand-royal-light transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link href="/library" className="hover:text-brand-royal-light transition-colors">المكتبة</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-brand-royal-light font-bold">{book.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-64 rounded-3xl bg-royal-linear flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain bg-brand-navy/60" />
                ) : (
                  <FileText className="w-16 h-16 text-white/40" />
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">{book.title}</h1>
              <p className="text-lg text-brand-white/60 font-tajawal leading-relaxed">{book.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="glass-dark border border-white/5 p-5 rounded-2xl text-center">
                  <User2 className="w-5 h-5 text-brand-royal-light mx-auto mb-2" />
                  <div className="text-xs text-brand-white/40 font-tajawal">المؤلف</div>
                  <div className="text-sm font-bold text-brand-white font-tajawal">{book.author}</div>
                </div>
                {book.pagesCount && (
                  <div className="glass-dark border border-white/5 p-5 rounded-2xl text-center">
                    <BookOpenCheck className="w-5 h-5 text-brand-royal-light mx-auto mb-2" />
                    <div className="text-xs text-brand-white/40 font-tajawal">الصفحات</div>
                    <div className="text-sm font-bold text-brand-white font-tajawal">{book.pagesCount}</div>
                  </div>
                )}
                {book.category && (
                  <div className="glass-dark border border-white/5 p-5 rounded-2xl text-center">
                    <ShieldCheck className="w-5 h-5 text-brand-royal-light mx-auto mb-2" />
                    <div className="text-xs text-brand-white/40 font-tajawal">التصنيف</div>
                    <div className="text-sm font-bold text-brand-white font-tajawal">{book.category}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="glass-dark border border-brand-royal/15 rounded-[2rem] shadow-dark-xl p-8 sticky top-32 space-y-6">
                <div className="text-center pb-6 border-b border-white/5">
                  <span className="text-5xl font-black text-brand-white">{book.price}</span>
                  <span className="text-xl font-bold text-brand-royal-light mr-2">₪</span>
                </div>
                <BookPurchaseButton
                  bookId={book.id}
                  isLoggedIn={!!user}
                  hasAccess={hasAccess}
                  purchaseStatus={purchase?.status || null}
                  pdfUrl={hasAccess ? book.pdfFileKey : null}
                />
                {hasAccess && (
                  <BookReader
                    bookId={book.id}
                    pdfUrl={book.pdfFileKey}
                    pagesCount={book.pagesCount}
                    initialProgress={purchase?.readProgress || 0}
                  />
                )}
                {hasAccess && purchase && (
                  <a
                    href={`/api/books/purchases/${purchase.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-brand-white/40 hover:text-brand-royal-light font-tajawal underline underline-offset-2"
                  >
                    تحميل إيصال الشراء (PDF)
                  </a>
                )}
                <p className="text-xs text-brand-white/40 font-tajawal text-center">
                  الدفع عبر التحويل البنكي المباشر، ويُفعَّل وصولك للكتاب بعد التحقق من التحويل.
                </p>
              </div>

              {book.bundleCourse && book.bundlePrice && (
                <Link href={`/courses/${book.bundleCourse.slug}`} className="block glass-royal border border-brand-royal/30 rounded-2xl p-5 mt-4 hover:border-brand-royal/50 transition-colors">
                  <div className="flex items-center gap-2 text-brand-royal-light text-sm font-tajawal font-bold mb-2">
                    <Package size={16} /> عرض باقة موفّر
                  </div>
                  <p className="text-xs text-brand-white/60 font-tajawal mb-2">احصل على هذا الكتاب مع دورة "{book.bundleCourse.title}" معًا بسعر</p>
                  <p className="text-brand-white font-tajawal font-black text-xl">{book.bundlePrice} ₪ <span className="text-xs text-brand-white/40 line-through font-normal">{(book.price + book.bundleCourse.price).toFixed(0)} ₪</span></p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
