"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Trophy, Play, RotateCcw, Lock, Keyboard } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

const LEVELS = [
  {
    label: 'المستوى 1: أساسيات', desc: 'أسطر قصيرة وبسيطة',
    snippets: [
      "const name = 'Arkan';",
      "let x = 10;",
      "console.log('Hello');",
      "if (x > 5) { return true; }",
    ],
  },
  {
    label: 'المستوى 2: متوسط', desc: 'دوال وهياكل بيانات',
    snippets: [
      "const [state, setState] = useState(null);",
      "function calculateTotal(price, tax) { return price + (price * tax); }",
      "import { useState, useEffect } from 'react';",
      "const items = array.map(item => item.id);",
    ],
  },
  {
    label: 'المستوى 3: متقدم', desc: 'أنماط برمجية أكثر تعقيدًا',
    snippets: [
      "export default function App() { return <div>Hello World</div>; }",
      "const result = await fetch('/api/data').then(res => res.json());",
      "type User = { id: string; name: string; role: 'ADMIN' | 'STUDENT'; };",
      "const debounced = useCallback(debounce(handleChange, 300), []);",
    ],
  },
];

export default function CodeTyper({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const snippets = levelIndex !== null ? LEVELS[levelIndex].snippets : [];
  const currentSnippet = snippets[currentSnippetIndex] || '';

  const startGame = (idx: number) => {
    setLevelIndex(idx);
    setIsPlaying(true);
    setGameOver(false);
    setUserInput('');
    setCurrentSnippetIndex(0);
    setStartTime(Date.now());
    setWpm(0);
    setAccuracy(100);
    setScore(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentSnippet[i]) correctChars++;
    }
    const acc = value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;
    setAccuracy(acc);

    if (value === currentSnippet && levelIndex !== null) {
      if (currentSnippetIndex < snippets.length - 1) {
        setCurrentSnippetIndex((prev) => prev + 1);
        setUserInput('');
      } else {
        setGameOver(true);
        setIsPlaying(false);
        const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
        const words = snippets.join(' ').length / 5;
        const finalWpm = Math.round(words / Math.max(timeElapsed, 0.1));
        setWpm(finalWpm);

        const finalScore = Math.round((finalWpm * acc) / 10) + levelIndex * 20;
        setScore(finalScore);
        submitScore(finalScore, levelIndex);
        setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
      }
    }
  };

  const renderText = () =>
    currentSnippet.split('').map((char, i) => {
      let color = 'text-slate-500';
      if (i < userInput.length) color = userInput[i] === char ? 'text-green-500' : 'text-red-500 bg-red-100';
      return <span key={i} className={`font-mono text-xl ${color}`}>{char}</span>;
    });

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">اختبار سرعة الكتابة</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى بأسطر برمجية أعقد من اللي قبله.</p>
        </div>
        <div className="space-y-4">
          {LEVELS.map((l, i) => {
            const locked = i + 1 > unlockedLevels;
            return (
              <button
                key={l.label}
                onClick={() => !locked && startGame(i)}
                disabled={locked}
                className={`w-full text-right p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  locked ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-brand-royal/20 hover:border-brand-royal shadow-sm hover:shadow-lg'
                }`}
              >
                <div>
                  <p className="font-black text-brand-navy text-lg">{l.label}</p>
                  <p className="text-sm text-gray-500">{l.desc}</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Keyboard className="text-brand-royal" size={26} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">{LEVELS[levelIndex].label}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-royal/20">
        <div className="flex justify-between items-center mb-8 px-8 bg-slate-900 text-white p-6 rounded-2xl">
          <div className="text-center">
            <p className="text-sm text-slate-400 font-bold mb-1">السرعة (WPM)</p>
            <p className="text-3xl font-black text-brand-royal">{wpm}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 font-bold mb-1">الدقة</p>
            <p className="text-3xl font-black text-brand-royal">{accuracy}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 font-bold mb-1">النقاط</p>
            <p className="text-3xl font-black text-white">{score}</p>
          </div>
        </div>

        {isPlaying && (
          <div className="space-y-8" dir="ltr">
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-slate-200 min-h-[120px] flex items-center justify-center leading-relaxed">
              <div className="tracking-wide">{renderText()}</div>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full p-6 text-xl font-mono bg-white border-2 border-brand-navy/20 rounded-2xl focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 outline-none transition-all shadow-sm"
              placeholder="Start typing..."
              autoComplete="off"
              spellCheck="false"
            />
            <div className="text-center text-slate-500 font-bold">المرحلة {currentSnippetIndex + 1} من {snippets.length}</div>
          </div>
        )}

        {gameOver && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-24 h-24 bg-brand-royal rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-brand-navy mb-4">انتهى المستوى!</h2>
            <p className="text-xl text-gray-600 mb-8">
              كتبت بسرعة <span className="font-bold text-brand-navy">{wpm}</span> كلمة/دقيقة بدقة <span className="font-bold text-brand-navy">{accuracy}%</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => startGame(levelIndex)} className="px-8 py-4 bg-white border-2 border-brand-navy/20 text-brand-navy rounded-xl font-bold transition-all flex items-center gap-2">
                إعادة المحاولة <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={() => setLevelIndex(null)} className="px-8 py-4 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center gap-2">
                <Play className="w-5 h-5" /> قائمة المستويات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
