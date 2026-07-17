"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Trophy, Play, RotateCcw, Lock, Paintbrush } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

interface TargetProp { prop: keyof CSSStyleDeclaration; expected: string; label: string; }

const LEVELS: { label: string; desc: string; initialCss: string; target: TargetProp[]; previewBg: string }[] = [
  {
    label: 'المستوى 1: دائرة بسيطة', desc: 'حوّل المربع لدائرة زرقاء',
    initialCss: '.box {\n  width: 100px;\n  height: 100px;\n  background: #f0f0f0;\n}',
    target: [
      { prop: 'width', expected: '100px', label: 'العرض 100px' },
      { prop: 'height', expected: '100px', label: 'الارتفاع 100px' },
      { prop: 'borderRadius', expected: '50%', label: 'الاستدارة الكاملة (دائرة)' },
      { prop: 'backgroundColor', expected: 'rgb(59, 91, 219)', label: 'خلفية زرقاء ملكية #3B5BDB' },
    ],
    previewBg: '#1e293b',
  },
  {
    label: 'المستوى 2: بطاقة مستديرة الحواف', desc: 'مستطيل بحواف دائرية وحدود',
    initialCss: '.box {\n  width: 160px;\n  height: 100px;\n  background: #f0f0f0;\n}',
    target: [
      { prop: 'width', expected: '160px', label: 'العرض 160px' },
      { prop: 'height', expected: '100px', label: 'الارتفاع 100px' },
      { prop: 'borderRadius', expected: '16px', label: 'حواف دائرية 16px' },
      { prop: 'backgroundColor', expected: 'rgb(15, 24, 48)', label: 'خلفية كحلية #0F1830' },
      { prop: 'borderColor', expected: 'rgb(124, 147, 240)', label: 'حدود بلون #7C93F0' },
    ],
    previewBg: '#f2f5fa',
  },
  {
    label: 'المستوى 3: شارة بيضاوية', desc: 'شكل بيضاوي بظل واضح',
    initialCss: '.box {\n  width: 180px;\n  height: 80px;\n  background: #f0f0f0;\n}',
    target: [
      { prop: 'width', expected: '180px', label: 'العرض 180px' },
      { prop: 'height', expected: '80px', label: 'الارتفاع 80px' },
      { prop: 'borderRadius', expected: '40px', label: 'حواف بيضاوية 40px' },
      { prop: 'backgroundColor', expected: 'rgb(199, 208, 222)', label: 'خلفية فضية #C7D0DE' },
      { prop: 'boxShadow', expected: '0px 0px 20px', label: 'ظل واضح 20px', },
    ],
    previewBg: '#070B14',
  },
];

export default function CssBattle({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [cssCode, setCssCode] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [matchedProps, setMatchedProps] = useState<Set<string>>(new Set());
  const testRef = useRef<HTMLDivElement>(null);

  const submitScore = useCallback(async (finalScore: number, lvl: number) => {
    if (!user) return;
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug, score: finalScore, level: lvl + 1 }),
      });
    } catch (error) { console.error('Failed to submit score', error); }
  }, [user, gameSlug]);

  function startLevel(idx: number) {
    setLevelIndex(idx);
    setCssCode(LEVELS[idx].initialCss);
    setGameOver(false);
    setScore(0);
    setMatchedProps(new Set());
  }

  function handleSubmit() {
    if (levelIndex === null || !testRef.current) return;
    const target = LEVELS[levelIndex].target;

    // نطبّق CSS المستخدم فعليًا على عنصر حقيقي بالصفحة ونقرأ القيم المحسوبة الحقيقية
    const styleTag = document.createElement('style');
    styleTag.innerHTML = cssCode;
    document.head.appendChild(styleTag);

    const computed = window.getComputedStyle(testRef.current);
    const matched = new Set<string>();

    target.forEach((t) => {
      const actual = String(computed[t.prop as any] || '');
      if (t.prop === 'boxShadow') {
        if (actual && actual !== 'none') matched.add(t.label);
      } else if (actual.replace(/\s/g, '') === t.expected.replace(/\s/g, '')) {
        matched.add(t.label);
      }
    });

    document.head.removeChild(styleTag);

    const calculatedScore = Math.round((matched.size / target.length) * 100);
    setMatchedProps(matched);
    setScore(calculatedScore);
    setGameOver(true);

    if (calculatedScore >= 75) {
      submitScore(calculatedScore + levelIndex * 20, levelIndex);
      setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
    }
  }

  function generatePreviewHtml() {
    if (levelIndex === null) return '';
    return `
      <html><head><style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: ${LEVELS[levelIndex].previewBg}; }
        ${cssCode}
      </style></head><body><div class="box"></div></body></html>
    `;
  }

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">معركة CSS</h1>
          <p className="text-gray-600">اختر المستوى — حاكِ الشكل المطلوب بدقة باستخدام CSS.</p>
        </div>
        <div className="space-y-4">
          {LEVELS.map((l, i) => {
            const locked = i + 1 > unlockedLevels;
            return (
              <button
                key={l.label}
                onClick={() => !locked && startLevel(i)}
                disabled={locked}
                className={`w-full text-right p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  locked ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-brand-royal/20 hover:border-brand-royal shadow-sm hover:shadow-lg'
                }`}
              >
                <div>
                  <p className="font-black text-brand-navy text-lg">{l.label}</p>
                  <p className="text-sm text-gray-500">{l.desc}</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Paintbrush className="text-brand-royal" size={26} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const target = LEVELS[levelIndex].target;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
      {/* عنصر اختبار حقيقي مخفي لقياس القيم المحسوبة فعليًا */}
      <div className="fixed -left-[9999px] top-0"><div ref={testRef} className="box" /></div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-navy mb-2">{LEVELS[levelIndex].label}</h1>
        <p className="text-gray-600">{LEVELS[levelIndex].desc}</p>
      </div>

      <div className="mb-6 bg-white rounded-2xl border border-brand-royal/20 p-4 flex flex-wrap gap-2 justify-center" dir="rtl">
        {target.map((t) => (
          <span key={t.label} className={`text-xs px-3 py-1.5 rounded-full font-bold ${matchedProps.has(t.label) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {matchedProps.has(t.label) ? '✓ ' : ''}{t.label}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 h-[550px]">
        <div className="lg:col-span-1 bg-slate-900 rounded-3xl shadow-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-brand-royal font-bold">محرر CSS</span>
            <span className="text-slate-400 text-sm font-mono">{cssCode.length} حرف</span>
          </div>
          <textarea
            className="flex-grow bg-transparent text-white font-mono p-6 outline-none resize-none"
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            dir="ltr"
            spellCheck="false"
          />
          <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-3">
            <button onClick={handleSubmit} className="flex-1 py-3 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              تحقق من الحل <Play className="w-5 h-5" />
            </button>
            {gameOver && (
              <button onClick={() => startLevel(levelIndex)} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors">
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border-4 border-brand-royal/30 relative">
            <div className="absolute top-4 right-4 z-10 bg-brand-royal text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">النتيجة الخاصة بك</div>
            <iframe title="preview" className="w-full h-full border-0" srcDoc={generatePreviewHtml()} />
            {gameOver && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
                <div className="w-20 h-20 bg-brand-royal rounded-full flex items-center justify-center mb-4 shadow-xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">{score >= 75 ? 'أحسنت! اجتزت المستوى' : 'قريب، جرّب تاني'}</h3>
                <div className="text-5xl font-bold text-brand-royal">{score}%</div>
                {score >= 75 && (
                  <button onClick={() => setLevelIndex(null)} className="mt-4 px-6 py-2.5 bg-brand-navy text-white rounded-xl font-bold">قائمة المستويات</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
