'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`group glass-dark rounded-2xl border overflow-hidden transition-all duration-500 ${
              isOpen
                ? 'border-brand-royal/40 shadow-royal-glow'
                : 'border-brand-royal/10 hover:border-brand-royal/25'
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full text-right px-7 py-5 flex items-center justify-between gap-4 focus:outline-none"
            >
              {/* Number + question */}
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-inter flex-shrink-0 transition-all duration-300 ${
                  isOpen ? 'royal-gradient text-brand-dark shadow-royal-glow-sm' : 'bg-brand-white/5 text-brand-royal/60'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`text-base md:text-lg font-tajawal font-bold transition-colors duration-300 ${
                  isOpen ? 'text-brand-royal' : 'text-brand-white group-hover:text-brand-royal/80'
                }`}>
                  {faq.question}
                </span>
              </div>

              {/* Toggle icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isOpen ? 'royal-gradient shadow-royal-glow-sm rotate-45' : 'bg-brand-white/5 text-brand-royal/50'
              }`}>
                <Plus className="w-4 h-4 text-brand-dark" />
              </div>
            </button>

            {/* Answer panel */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-7 pb-6 pt-1">
                {/* Separator */}
                <div className="w-full h-px bg-gradient-to-r from-brand-royal/30 via-brand-royal/10 to-transparent mb-5" />
                <p className="text-brand-white/60 font-tajawal text-base leading-loose">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
