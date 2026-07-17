"use client";

import React, { useState, useCallback } from 'react';
import { Trophy, Play, RotateCcw, Lock, Shield } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

interface Challenge { target: string; description: string; indicator: 'center' | 'end' | 'between' | 'centerBoth' | 'column' | 'wrap'; }

const TIERS: { label: string; desc: string; challenges: Challenge[] }[] = [
  {
    label: 'المستوى 1: أساسيات المحور الأفقي', desc: 'justify-content',
    challenges: [
      { target: 'justify-content: center;', description: 'العدو في المنتصف! استخدم justify-content لصد الهجوم.', indicator: 'center' },
      { target: 'justify-content: flex-end;', description: 'العدو على اليمين! استخدم justify-content للوصول إليه.', indicator: 'end' },
    ],
  },
  {
    label: 'المستوى 2: محورين مع بعض', desc: 'justify-content + align-items',
    challenges: [
      { target: 'justify-content: space-between;', description: 'عدوان على الأطراف! استخدم space-between.', indicator: 'between' },
      { target: 'align-items: center; justify-content: center;', description: 'العدو في المنتصف تمامًا (أفقيًا وعموديًا).', indicator: 'centerBoth' },
    ],
  },
  {
    label: 'المستوى 3: اتجاه وتفاف متقدم', desc: 'flex-direction + flex-wrap',
    challenges: [
      { target: 'flex-direction: column; align-items: center;', description: 'رتّب الدفاع عموديًا بمحاذاة وسط.', indicator: 'column' },
      { target: 'flex-wrap: wrap; justify-content: center;', description: 'خلي العناصر تلتف وتترتب بالمنتصف.', indicator: 'wrap' },
    ],
  },
];

export default function FlexboxDefender({ user, gameSlug }: Props) {
  const [tierIndex, setTierIndex] = useState<number | null>(null);
  const [unlockedTiers, setUnlockedTiers] = useState(1);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const challenges = tierIndex !== null ? TIERS[tierIndex].challenges : [];
  const challenge = challenges[challengeIndex];

  const submitScore = useCallback(async (finalScore: number, tier: number) => {
    if (!user) return;
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug, score: finalScore, level: tier + 1 }),
      });
    } catch (error) { console.error('Failed to submit score', error); }
  }, [user, gameSlug]);

  function handleCheck() {
    if (!challenge) return;
    const normalizedInput = userInput.replace(/\s+/g, '').replace(/;/g, '');
    const normalizedTarget = challenge.target.replace(/\s+/g, '').replace(/;/g, '');

    if (normalizedInput.includes(normalizedTarget) || normalizedTarget.includes(normalizedInput)) {
      const newScore = score + 100;
      setScore(newScore);
      setMessage('عمل رائع! تم صد الهجوم.');
      setTimeout(() => {
        if (challengeIndex < challenges.length - 1) {
          setChallengeIndex((prev) => prev + 1);
          setUserInput('');
          setMessage('');
        } else if (tierIndex !== null) {
          setGameOver(true);
          submitScore(newScore, tierIndex);
          setUnlockedTiers((u) => Math.max(u, tierIndex + 2));
        }
      }, 1200);
    } else {
      setMessage('إجابة خاطئة. حاول مرة أخرى!');
    }
  }

  function startTier(idx: number) {
    setTierIndex(idx);
    setChallengeIndex(0);
    setUserInput('');
    setScore(0);
    setGameOver(false);
    setMessage('');
  }

  function getFlexStyle() {
    try {
      const styles = userInput.split(';').reduce((acc: any, curr) => {
        const [key, value] = curr.split(':');
        if (key && value) acc[key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value.trim();
        return acc;
      }, {});
      return { display: 'flex', width: '100%', height: '100%', ...styles };
    } catch {
      return { display: 'flex', width: '100%', height: '100%' };
    }
  }

  if (tierIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">مدافع الفليكس بوكس</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى فيه تحديين Flexbox أعقد من اللي قبله.</p>
        </div>
        <div className="space-y-4">
          {TIERS.map((t, i) => {
            const locked = i + 1 > unlockedTiers;
            return (
              <button
                key={t.label}
                onClick={() => !locked && startTier(i)}
                disabled={locked}
                className={`w-full text-right p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  locked ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-brand-royal/20 hover:border-brand-royal shadow-sm hover:shadow-lg'
                }`}
              >
                <div>
                  <p className="font-black text-brand-navy text-lg">{t.label}</p>
                  <p className="text-sm text-gray-500 font-mono" dir="ltr">{t.desc}</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Shield className="text-brand-royal" size={26} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl" dir="rtl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">{TIERS[tierIndex].label}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-brand-royal/20 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 bg-slate-900 text-white flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-royal">التحدي {challengeIndex + 1} من {challenges.length}</h2>
            <div className="flex items-center gap-2 text-brand-royal">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{score}</span>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl mb-6">
            <p className="text-gray-300 mb-2 font-mono text-sm">/* المهمة */</p>
            <p className="text-white text-lg">{challenge.description}</p>
          </div>

          <div className="flex-grow">
            <div className="bg-slate-950 p-4 rounded-t-xl font-mono text-sm text-gray-400">
              #defender-container {'{'}<br />&nbsp;&nbsp;display: flex;
            </div>
            <textarea
              className="w-full bg-slate-900 text-brand-royal font-mono p-4 outline-none resize-none border-x border-slate-700 h-32"
              placeholder="اكتب أكواد flexbox هنا..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              dir="ltr"
              spellCheck="false"
              disabled={gameOver}
            />
            <div className="bg-slate-950 p-4 rounded-b-xl font-mono text-sm text-gray-400">{'}'}</div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center font-bold ${message.includes('رائع') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message}
            </div>
          )}

          {!gameOver ? (
            <button onClick={handleCheck} className="mt-6 w-full py-4 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              تنفيذ الكود <Play className="w-5 h-5" />
            </button>
          ) : (
            <div className="mt-6 flex gap-3">
              <button onClick={() => startTier(tierIndex)} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> إعادة
              </button>
              <button onClick={() => setTierIndex(null)} className="flex-1 py-4 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <Play className="w-5 h-5" /> المستويات
              </button>
            </div>
          )}
        </div>

        <div className="md:w-1/2 bg-slate-100 p-8 flex flex-col relative h-[500px] md:h-auto border-r border-slate-200">
          <div className="absolute top-4 left-4 right-4 flex justify-between text-sm font-mono text-slate-400 pointer-events-none">
            <span>Browser View</span>
            <span>#defender-container</span>
          </div>

          <div className="flex-grow border-4 border-dashed border-slate-300 rounded-2xl relative overflow-hidden mt-8 p-4">
            <div className="w-full h-full bg-slate-200/50 rounded-xl transition-all duration-500" style={getFlexStyle()}>
              <div className="w-16 h-16 bg-brand-navy rounded-lg shadow-lg flex items-center justify-center animate-bounce border-2 border-brand-royal">🛡️</div>
            </div>

            {challenge.indicator === 'center' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-brand-royal/50 rounded-full animate-pulse pointer-events-none" />}
            {challenge.indicator === 'end' && <div className="absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 border-4 border-brand-royal/50 rounded-full animate-pulse pointer-events-none" />}
            {challenge.indicator === 'between' && (
              <>
                <div className="absolute top-1/2 left-4 -translate-y-1/2 w-20 h-20 border-4 border-brand-royal/50 rounded-full animate-pulse pointer-events-none" />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 border-4 border-brand-royal/50 rounded-full animate-pulse pointer-events-none" />
              </>
            )}
            {(challenge.indicator === 'centerBoth' || challenge.indicator === 'column' || challenge.indicator === 'wrap') && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-brand-royal/50 rounded-full animate-pulse pointer-events-none" />
            )}
          </div>

          {gameOver && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="w-24 h-24 bg-brand-royal rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-brand-navy mb-4">انتصار عظيم!</h2>
              <div className="text-4xl font-bold text-brand-royal">{score} <span className="text-xl text-gray-500">نقطة</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
