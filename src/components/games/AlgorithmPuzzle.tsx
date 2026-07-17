"use client";

import React, { useState, useCallback } from 'react';
import { Trophy, Play, CheckCircle2, XCircle, Lock, Code2 } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

interface Puzzle {
  title: string;
  description: string;
  initialCode: string;
  testCases: { input: string; expected: string }[];
  evalCheck: (code: string) => boolean;
}

const LEVELS: { label: string; desc: string; puzzles: Puzzle[] }[] = [
  {
    label: 'المستوى 1: أساسيات', desc: 'مصفوفات ودوال بسيطة',
    puzzles: [
      {
        title: 'مجموع المصفوفة',
        description: 'اكتب دالة ترجع مجموع كل الأرقام في مصفوفة معطاة.',
        initialCode: 'function sumArray(arr) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: '[1, 2, 3]', expected: '6' }, { input: '[10, -10, 5]', expected: '5' }],
        evalCheck: (code) => {
          try {
            const fn = new Function('arr', code + '\nreturn sumArray(arr);');
            return fn([1, 2, 3]) === 6 && fn([10, -10, 5]) === 5;
          } catch { return false; }
        },
      },
      {
        title: 'إيجاد العدد الأكبر',
        description: 'اكتب دالة ترجع أكبر رقم في المصفوفة.',
        initialCode: 'function findMax(arr) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: '[1, 5, 3]', expected: '5' }, { input: '[-1, -5, -3]', expected: '-1' }],
        evalCheck: (code) => {
          try {
            const fn = new Function('arr', code + '\nreturn findMax(arr);');
            return fn([1, 5, 3]) === 5 && fn([-1, -5, -3]) === -1;
          } catch { return false; }
        },
      },
    ],
  },
  {
    label: 'المستوى 2: متوسط', desc: 'سلاسل نصية ومنطق شرطي',
    puzzles: [
      {
        title: 'عكس النص',
        description: 'اكتب دالة ترجع النص معكوسًا.',
        initialCode: 'function reverseStr(str) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: "'arkan'", expected: "'nakra'" }, { input: "'hello'", expected: "'olleh'" }],
        evalCheck: (code) => {
          try {
            const fn = new Function('str', code + '\nreturn reverseStr(str);');
            return fn('arkan') === 'nakra' && fn('hello') === 'olleh';
          } catch { return false; }
        },
      },
      {
        title: 'الأعداد الفردية',
        description: 'اكتب دالة ترجع مصفوفة فيها الأعداد الفردية فقط من المصفوفة الأصلية.',
        initialCode: 'function onlyOdd(arr) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: '[1,2,3,4,5]', expected: '[1,3,5]' }],
        evalCheck: (code) => {
          try {
            const fn = new Function('arr', code + '\nreturn onlyOdd(arr);');
            const r = fn([1, 2, 3, 4, 5]);
            return JSON.stringify(r) === JSON.stringify([1, 3, 5]);
          } catch { return false; }
        },
      },
    ],
  },
  {
    label: 'المستوى 3: متقدم', desc: 'خوارزميات وتكرار',
    puzzles: [
      {
        title: 'هل الرقم أولي؟',
        description: 'اكتب دالة ترجع true لو الرقم أولي، وfalse غير ذلك.',
        initialCode: 'function isPrime(n) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: '7', expected: 'true' }, { input: '10', expected: 'false' }],
        evalCheck: (code) => {
          try {
            const fn = new Function('n', code + '\nreturn isPrime(n);');
            return fn(7) === true && fn(10) === false && fn(2) === true;
          } catch { return false; }
        },
      },
      {
        title: 'فيبوناتشي',
        description: 'اكتب دالة ترجع العنصر رقم n من متتالية فيبوناتشي (تبدأ من 0).',
        initialCode: 'function fib(n) {\n  // اكتب الكود هنا\n\n}',
        testCases: [{ input: '5', expected: '5' }, { input: '8', expected: '21' }],
        evalCheck: (code) => {
          try {
            const fn = new Function('n', code + '\nreturn fib(n);');
            return fn(5) === 5 && fn(8) === 21 && fn(0) === 0;
          } catch { return false; }
        },
      },
    ],
  },
];

export default function AlgorithmPuzzle({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [score, setScore] = useState(0);

  const puzzles = levelIndex !== null ? LEVELS[levelIndex].puzzles : [];
  const puzzle = puzzles[puzzleIndex];
  const levelDone = levelIndex !== null && puzzleIndex >= puzzles.length;

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
    setPuzzleIndex(0);
    setCode(LEVELS[idx].puzzles[0].initialCode);
    setResult(null);
    setScore(0);
  }

  function handleRun() {
    if (!puzzle) return;
    const isCorrect = puzzle.evalCheck(code);
    if (isCorrect) {
      setResult('success');
      const newScore = score + 100;
      setScore(newScore);
      if (puzzleIndex === puzzles.length - 1 && levelIndex !== null) {
        submitScore(newScore, levelIndex);
        setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
      }
    } else {
      setResult('error');
    }
  }

  function nextPuzzle() {
    if (levelIndex === null) return;
    const next = puzzleIndex + 1;
    setPuzzleIndex(next);
    setResult(null);
    if (next < puzzles.length) setCode(puzzles[next].initialCode);
  }

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">ألغاز الخوارزميات</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى فيه تحديين برمجيين أصعب من اللي قبلهم.</p>
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
                {locked ? <Lock className="text-gray-400" size={22} /> : <Code2 className="text-brand-royal" size={26} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-navy mb-2">{LEVELS[levelIndex].label}</h1>
      </div>

      {levelDone ? (
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-brand-royal/20 text-center space-y-6">
          <Trophy className="w-14 h-14 text-brand-royal mx-auto" />
          <h2 className="text-2xl font-black text-brand-navy">أنهيت المستوى! 🎉</h2>
          <p className="text-gray-600">نقاطك: <span className="font-bold text-brand-royal">{score}</span></p>
          <button onClick={() => setLevelIndex(null)} className="px-8 py-4 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-all inline-flex items-center gap-2">
            <Play size={18} /> قائمة المستويات
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-brand-royal/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-brand-navy">التحدي {puzzleIndex + 1}/{puzzles.length}</h2>
                <div className="flex items-center gap-2 bg-brand-royal/10 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-brand-royal" />
                  <span className="font-bold text-brand-navy">{score}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-brand-royal mb-2">{puzzle.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{puzzle.description}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="font-bold text-sm text-gray-500 mb-3">حالات الاختبار:</h4>
                <ul className="space-y-3" dir="ltr">
                  {puzzle.testCases.map((tc, i) => (
                    <li key={i} className="font-mono text-sm bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex justify-between">
                      <span className="text-blue-600">Input: {tc.input}</span>
                      <span className="text-green-600 font-bold">➔ {tc.expected}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-[#1e1e1e] rounded-3xl shadow-xl overflow-hidden flex-grow border border-slate-800 flex flex-col min-h-[400px]">
              <div className="bg-[#2d2d2d] px-6 py-3 border-b border-[#404040] flex justify-between items-center">
                <span className="text-gray-300 font-mono text-sm">main.js</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full flex-grow bg-transparent text-white font-mono p-6 outline-none resize-none"
                spellCheck="false"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-grow w-full">
                {result === 'success' && (
                  <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-200 flex items-center gap-3 font-bold">
                    <CheckCircle2 className="w-6 h-6" /> إجابة صحيحة! لقد اجتزت جميع الاختبارات.
                  </div>
                )}
                {result === 'error' && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-3 font-bold">
                    <XCircle className="w-6 h-6" /> إجابة خاطئة. تأكد من صحة الكود ومطابقته لحالات الاختبار.
                  </div>
                )}
              </div>

              <div className="flex gap-4 w-full sm:w-auto shrink-0">
                <button onClick={handleRun} className="flex-1 sm:flex-none px-8 py-4 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg">
                  تشغيل الكود <Play className="w-5 h-5" />
                </button>
                {result === 'success' && (
                  <button onClick={nextPuzzle} className="flex-1 sm:flex-none px-8 py-4 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center shadow-lg">
                    {puzzleIndex < puzzles.length - 1 ? 'التحدي التالي' : 'إنهاء المستوى'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
