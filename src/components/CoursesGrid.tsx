'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Users, Star } from 'lucide-react';

interface CourseCard {
  id: string; title: string; slug: string; shortDescription: string | null;
  description: string; price: number; compareAtPrice: number | null;
  level: string; category: string | null; image: string | null;
  enrollmentsCount: number; lessonsCount: number; avgRating: number | null;
  progress?: number | null;
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'مبتدئ', color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
  INTERMEDIATE: { label: 'متوسط', color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
  ADVANCED: { label: 'متقدم', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
  ALL_LEVELS: { label: 'كل المستويات', color: 'text-brand-royal-light border-brand-royal/30 bg-brand-royal/10' },
};

export default function CoursesGrid({ courses }: { courses: CourseCard[] }) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [category, setCategory] = useState('ALL');

  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category).filter(Boolean))) as string[],
    [courses]
  );

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = level === 'ALL' || c.level === level;
      const matchesCategory = category === 'ALL' || c.category === category;
      return matchesQuery && matchesLevel && matchesCategory;
    });
  }, [courses, query, level, category]);

  return (
    <div>
      {/* أدوات الفلترة والبحث */}
      <div className="glass-dark border border-white/5 rounded-2xl p-4 mb-10 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-silver-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن دورة..."
            className="input-premium w-full pr-10 text-sm font-tajawal"
          />
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-premium text-sm font-tajawal">
          <option value="ALL">كل المستويات</option>
          <option value="BEGINNER">مبتدئ</option>
          <option value="INTERMEDIATE">متوسط</option>
          <option value="ADVANCED">متقدم</option>
        </select>
        {categories.length > 0 && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-premium text-sm font-tajawal">
            <option value="ALL">كل المسارات</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="text-xs text-brand-silver-dim font-tajawal">{filtered.length} دورة</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="w-12 h-12 text-brand-silver-dim mx-auto mb-4" />
          <p className="text-brand-white/50 font-tajawal">
            {courses.length === 0 ? 'لا توجد دورات منشورة حاليًا، تابعنا قريبًا.' : 'لا توجد نتائج مطابقة لبحثك.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const badge = LEVEL_LABELS[c.level] || LEVEL_LABELS.ALL_LEVELS;
            return (
              <Link key={c.id} href={`/courses/${c.slug}`} className="card-premium bg-brand-navy/50 glass-dark rounded-2xl border border-white/5 hover:border-brand-royal/30 transition-all overflow-hidden group">
                <div className="h-40 bg-royal-linear relative overflow-hidden flex items-center justify-center">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt={c.title} className="w-full h-full object-contain bg-brand-navy/60" />
                  ) : (
                    <BookOpen className="w-10 h-10 text-white/40" />
                  )}
                  <span className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-tajawal font-bold border ${badge.color}`}>{badge.label}</span>
                </div>
                <div className="p-6">
                  {c.category && <span className="text-[11px] text-brand-royal-light font-tajawal font-bold">{c.category}</span>}
                  <h3 className="font-tajawal font-bold text-brand-white mt-1 mb-2 group-hover:text-brand-royal-light transition-colors line-clamp-1">{c.title}</h3>
                  <p className="text-sm text-brand-white/50 font-tajawal line-clamp-2 mb-4">{c.shortDescription || c.description}</p>

                  {typeof c.progress === 'number' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] text-brand-white/40 font-tajawal mb-1">
                        <span>تقدمك</span><span>{Math.round(c.progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full royal-gradient" style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-brand-white/40 font-tajawal">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrollmentsCount}</span>
                      {c.avgRating && <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-brand-royal-light text-brand-royal-light" /> {c.avgRating.toFixed(1)}</span>}
                    </div>
                    <div className="text-left">
                      {c.compareAtPrice && <span className="text-[11px] text-brand-white/30 line-through ml-1 font-tajawal">{c.compareAtPrice} ₪</span>}
                      <span className="text-brand-royal-light font-tajawal font-black">{c.price} ₪</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
