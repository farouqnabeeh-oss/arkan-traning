'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Quote, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'سارة العتيبي',
    role: 'مطور واجهات أمامية',
    company: 'شركة Elm',
    content: 'كانت منصة أركان نقطة التحول الحقيقية في مسيرتي. لعبة Flexbox Defender جعلتني أتقن التنسيق في يوم واحد، والمساعد الذكي كان كمعلم خاص 24/7. لا أتخيل رحلتي دونها.',
    avatar: '👩‍💻',
    rating: 5,
  },
  {
    id: 2,
    name: 'عبد الرحمن الشمري',
    role: 'مطور تطبيقات',
    company: 'طالب علوم حاسب',
    content: 'الجمع بين التعلم النظري والألعاب البرمجية فريد من نوعه. حصلت على شهادة معتمدة برمز QR واستخدمتها في سيرتي الذاتية وحصلت على وظيفتي الأولى.',
    avatar: '👨‍💻',
    rating: 5,
  },
  {
    id: 3,
    name: 'فاطمة الدوسري',
    role: 'محللة بيانات',
    company: 'مستقلة',
    content: 'المحتوى مبني بعناية فائقة. المساعد الذكي RAG يعطي إجابات دقيقة مستندة من نصوص الدروس. أنصح كل من يريد تعلم البرمجة بجدية بالانضمام.',
    avatar: '👩‍🔬',
    rating: 5,
  },
  {
    id: 4,
    name: 'خالد المطيري',
    role: 'مهندس Backend',
    company: 'شركة ناشئة',
    content: 'بدأت من الصفر في بايثون وأنهيت المسار خلال شهرين فقط. التحديات البرمجية وألعاب الخوارزميات كانت ممتعة ومفيدة في نفس الوقت. تجربة لا تُنسى.',
    avatar: '👨‍🔧',
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => navigate('next'), 7000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const navigate = (dir: 'prev' | 'next') => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(prev =>
        dir === 'next'
          ? (prev + 1) % testimonials.length
          : (prev - 1 + testimonials.length) % testimonials.length
      );
      setAnimating(false);
    }, 300);
  };

  const current = testimonials[activeIndex];

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Cards grid — show 3 at a time on large screens */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, offset) => {
          const idx = (activeIndex + offset) % testimonials.length;
          const t = testimonials[idx];
          const isCenter = offset === 1;
          return (
            <div
              key={t.id}
              className={`relative glass-dark rounded-3xl p-7 border transition-all duration-500 flex flex-col gap-5 ${
                isCenter
                  ? 'border-brand-royal/40 shadow-royal-glow scale-105'
                  : 'border-brand-royal/10 opacity-60 scale-95'
              }`}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-brand-royal/30 rotate-180 absolute top-6 left-6" />

              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-brand-royal fill-brand-royal" />
                ))}
              </div>

              {/* Content */}
              <p className="text-brand-white/75 font-tajawal text-sm leading-loose flex-1">
                "{t.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-brand-white/5">
                <div className="w-11 h-11 rounded-full royal-gradient flex items-center justify-center text-xl flex-shrink-0 shadow-royal-glow-sm">
                  {t.avatar}
                </div>
                <div className="text-right">
                  <p className="text-brand-white font-tajawal font-bold text-sm">{t.name}</p>
                  <p className="text-brand-white/40 font-tajawal text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile / Tablet single card */}
      <div className="lg:hidden">
        <div
          className={`glass-dark rounded-3xl p-8 border border-brand-royal/30 shadow-royal-glow transition-all duration-300 ${
            animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          <Quote className="w-10 h-10 text-brand-royal/20 rotate-180 mb-4" />

          <div className="flex gap-1 mb-5">
            {[...Array(current.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-brand-royal fill-brand-royal" />
            ))}
          </div>

          <p className="text-brand-white/80 font-tajawal text-lg leading-loose mb-8">
            "{current.content}"
          </p>

          <div className="flex items-center gap-4 pt-5 border-t border-brand-white/5">
            <div className="w-12 h-12 rounded-full royal-gradient flex items-center justify-center text-2xl flex-shrink-0 shadow-royal-glow-sm">
              {current.avatar}
            </div>
            <div className="text-right">
              <p className="text-brand-white font-tajawal font-bold">{current.name}</p>
              <p className="text-brand-white/40 font-tajawal text-sm">{current.role} · {current.company}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={() => navigate('prev')}
          className="w-12 h-12 rounded-full glass-royal border border-brand-royal/30 text-brand-royal flex items-center justify-center hover:scale-110 hover:shadow-royal-glow-sm transition-all duration-300"
          aria-label="السابق"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 h-2.5 bg-brand-royal shadow-royal-glow-sm'
                  : 'w-2.5 h-2.5 bg-brand-white/20 hover:bg-brand-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('next')}
          className="w-12 h-12 rounded-full glass-royal border border-brand-royal/30 text-brand-royal flex items-center justify-center hover:scale-110 hover:shadow-royal-glow-sm transition-all duration-300"
          aria-label="التالي"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
