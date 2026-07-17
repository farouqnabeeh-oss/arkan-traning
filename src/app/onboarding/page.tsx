'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Loader2, BookOpen } from 'lucide-react';

const LEVELS = [
  { value: 'BEGINNER', label: 'مبتدئ تمامًا', desc: 'أول مرة أدخل عالم البرمجة' },
  { value: 'INTERMEDIATE', label: 'عندي أساسيات', desc: 'أعرف شوي بس بدي أتعمق' },
  { value: 'ADVANCED', label: 'متمكن', desc: 'بدور على تخصص متقدم' },
];

const INTERESTS = [
  { value: 'بايثون', label: 'بايثون', emoji: '🐍' },
  { value: 'ويب', label: 'تطوير ويب', emoji: '🌐' },
  { value: 'تصميم', label: 'تصميم UI/UX', emoji: '🎨' },
  { value: 'ALL', label: 'مش متأكد بعد', emoji: '🤔' },
];

interface Course { id: string; title: string; slug: string; price: number; }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('');
  const [interest, setInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<Course[] | null>(null);

  async function handleFinish() {
    setLoading(true);
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, interest }),
    });
    const data = await res.json();
    setLoading(false);
    setRecommended(data.recommended || []);
    setStep(3);
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-16">
        <div className="max-w-xl w-full">
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8 justify-center">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'w-12 royal-gradient' : 'w-6 bg-white/10'}`} />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="glass-dark border border-brand-royal/15 rounded-3xl p-8 md:p-10 space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <Sparkles className="w-8 h-8 text-brand-royal-light mx-auto" />
                <h1 className="text-2xl font-tajawal font-black text-brand-white">أهلًا فيك بأركان! 👋</h1>
                <p className="text-brand-white/50 font-tajawal text-sm">سؤالين بسيطين نقدر من خلالهم نقترحلك أفضل مسار تعليمي</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-tajawal font-bold text-brand-white/70">شو مستواك الحالي؟</p>
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => { setLevel(l.value); setStep(2); }}
                    className="w-full text-right p-4 rounded-2xl bg-white/5 hover:bg-brand-royal/10 border border-white/5 hover:border-brand-royal/30 transition-all group"
                  >
                    <p className="font-tajawal font-bold text-brand-white group-hover:text-brand-royal-light">{l.label}</p>
                    <p className="text-xs text-brand-white/40 font-tajawal">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="glass-dark border border-brand-royal/15 rounded-3xl p-8 md:p-10 space-y-6 animate-fade-in-up">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-tajawal font-black text-brand-white">شو بيشدّك أكتر؟</h1>
                <p className="text-brand-white/50 font-tajawal text-sm">راح نقترحلك دورات مناسبة بناءً على اهتمامك</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setInterest(i.value)}
                    className={`p-5 rounded-2xl border text-center transition-all ${
                      interest === i.value ? 'bg-brand-royal/15 border-brand-royal/40' : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{i.emoji}</div>
                    <p className="text-sm font-tajawal font-bold text-brand-white">{i.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-brand-white/40 hover:text-brand-white font-tajawal">
                  <ArrowRight size={15} /> رجوع
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!interest || loading}
                  className="flex-1 royal-gradient text-white font-tajawal font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={18} /> جارِ التحميل...</>
                  ) : (
                    <><ArrowLeft size={18} /> عرض الاقتراحات</>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && recommended && (
            <div className="glass-dark border border-brand-royal/15 rounded-3xl p-8 md:p-10 space-y-6 animate-fade-in-up text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-tajawal font-black text-brand-white">جاهز! هاي اقتراحاتنا لك</h1>

              {recommended.length === 0 ? (
                <p className="text-brand-white/50 font-tajawal text-sm">لسه ما فيه دورات منشورة بمجالك، تابعنا قريبًا!</p>
              ) : (
                <div className="space-y-3 text-right">
                  {recommended.map((c) => (
                    <Link key={c.id} href={`/courses/${c.slug}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-brand-royal/10 border border-white/5 hover:border-brand-royal/30 transition-all">
                      <div className="flex items-center gap-3">
                        <BookOpen size={18} className="text-brand-royal-light" />
                        <span className="font-tajawal font-bold text-brand-white text-sm">{c.title}</span>
                      </div>
                      <span className="text-brand-royal-light font-tajawal font-black text-sm">{c.price} ₪</span>
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/courses" className="block royal-gradient text-white font-tajawal font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
                استكشف كل الدورات
              </Link>
              <button onClick={() => router.push('/dashboard')} className="text-sm text-brand-white/40 hover:text-brand-white font-tajawal">
                تخطي، خذني للوحتي مباشرة
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
