'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, FileText, PlayCircle, Loader2 } from 'lucide-react';

interface Results { courses: any[]; books: any[]; lessons: any[]; }

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>({ courses: [], books: [], lessons: [] });
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults({ courses: [], books: [], lessons: [] });
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResults(d))
        .finally(() => setLoading(false));
    }, 300);
  }, [query]);

  const hasResults = results.courses.length > 0 || results.books.length > 0 || results.lessons.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((p) => !p)} className="w-10 h-10 flex items-center justify-center rounded-xl glass-dark border border-brand-royal/15 text-brand-white/70 hover:text-brand-royal-light transition-colors">
        <Search size={16} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 sm:w-96 glass-dark border border-brand-royal/15 rounded-2xl shadow-dark-xl overflow-hidden animate-fade-in-up" style={{ animationDuration: '150ms' }}>
          <div className="p-3 border-b border-white/5 flex items-center gap-2">
            <Search size={15} className="text-brand-white/30" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (results.courses.length > 0) {
                    router.push(`/courses/${results.courses[0].slug}`);
                    setOpen(false);
                    setQuery('');
                  } else if (results.books.length > 0) {
                    router.push(`/library/${results.books[0].slug}`);
                    setOpen(false);
                    setQuery('');
                  } else if (results.lessons.length > 0) {
                    router.push(`/courses/${results.lessons[0].courseSlug}`);
                    setOpen(false);
                    setQuery('');
                  }
                }
              }}
              placeholder="ابحث عن دورة، كتاب، أو درس..."
              className="flex-1 bg-transparent outline-none text-sm text-brand-white font-tajawal placeholder:text-brand-white/30"
            />
            {loading && <Loader2 size={14} className="animate-spin text-brand-royal-light" />}
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-brand-white/40" /></button>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {query.length >= 2 && !loading && !hasResults && (
              <p className="text-center text-xs text-brand-white/40 font-tajawal py-8">لا توجد نتائج مطابقة.</p>
            )}

            {results.courses.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] text-brand-white/30 font-tajawal px-2 mb-1">الدورات</p>
                {results.courses.map((c) => (
                  <Link key={c.id} href={`/courses/${c.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-sm text-brand-white/80 font-tajawal">
                    <BookOpen size={14} className="text-brand-royal-light shrink-0" /> {c.title}
                  </Link>
                ))}
              </div>
            )}

            {results.books.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <p className="text-[10px] text-brand-white/30 font-tajawal px-2 mb-1">المكتبة</p>
                {results.books.map((b) => (
                  <Link key={b.id} href={`/library/${b.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-sm text-brand-white/80 font-tajawal">
                    <FileText size={14} className="text-brand-royal-light shrink-0" /> {b.title}
                  </Link>
                ))}
              </div>
            )}

            {results.lessons.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <p className="text-[10px] text-brand-white/30 font-tajawal px-2 mb-1">الدروس</p>
                {results.lessons.map((l) => (
                  <Link key={l.id} href={`/courses/${l.courseSlug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 text-sm text-brand-white/80 font-tajawal">
                    <PlayCircle size={14} className="text-brand-royal-light shrink-0" /> {l.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
