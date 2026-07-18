import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import Link from "next/link";
import { Library, Sparkles, FileText, User2 } from "lucide-react";
import { fallbackBooks } from "@/lib/fallbackData";

async function getBooks() {
  try {
    return await db.book.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return fallbackBooks;
  }
}

export default async function LibraryPage() {
  const books = await getBooks();

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />

      <section className="relative pt-36 pb-16 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold mx-auto">
            <Sparkles className="w-4 h-4" /> {books.length} كتاب متخصص
          </div>
          <h1 className="text-4xl md:text-6xl font-tajawal font-black text-brand-white">
            المكتبة <span className="shimmer-text">الرقمية</span>
          </h1>
          <p className="text-lg text-brand-white/60 font-tajawal max-w-2xl mx-auto">
            كتب متخصصة بصيغة PDF تدعم رحلتك التعليمية، بأسلوب مبسّط ومباشر.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {books.length === 0 ? (
          <div className="text-center py-24">
            <Library className="w-12 h-12 text-brand-silver-dim mx-auto mb-4" />
            <p className="text-brand-white/50 font-tajawal">
              لا توجد كتب منشورة حاليًا، تابعنا قريبًا.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/library/${book.slug}`}
                className="card-premium bg-brand-navy/50 glass-dark rounded-2xl border border-white/5 hover:border-brand-royal/30 transition-all overflow-hidden group"
              >
                <div className="h-52 bg-royal-linear relative overflow-hidden flex items-center justify-center">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-contain bg-brand-navy/60 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-white/40" />
                  )}
                </div>
                <div className="p-6">
                  {book.category && (
                    <span className="text-[11px] text-brand-royal-light font-tajawal font-bold">
                      {book.category}
                    </span>
                  )}
                  <h3 className="font-tajawal font-bold text-brand-white mt-1 mb-2 group-hover:text-brand-royal-light transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-brand-white/50 font-tajawal line-clamp-2 mb-4">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-brand-white/40 font-tajawal">
                    <span className="flex items-center gap-1">
                      <User2 className="w-3 h-3" /> {book.author}
                    </span>
                    <span className="text-brand-royal-light font-tajawal font-black text-base">
                      {book.price} ₪
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
