"use client";

import React, { useState, useCallback, useRef } from 'react';
import { HandMetal, File, Scissors, Lock, Play, Brain } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

type Choice = 'rock' | 'paper' | 'scissors';

const choices = [
  { id: 'rock', icon: HandMetal, label: 'حجر', color: 'bg-slate-700' },
  { id: 'paper', icon: File, label: 'ورقة', color: 'bg-blue-600' },
  { id: 'scissors', icon: Scissors, label: 'مقص', color: 'bg-red-600' },
];

const BEATS: Record<Choice, Choice> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const LOSES_TO: Record<Choice, Choice> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };

const LEVELS = [
  { label: 'المستوى 1: عشوائي', desc: 'الذكاء الاصطناعي بيختار بشكل عشوائي تمامًا', target: 3, scorePerWin: 30 },
  { label: 'المستوى 2: متعلّم', desc: 'بيلاحظ اختياراتك الأكثر تكرارًا ويتوقعها', target: 3, scorePerWin: 50 },
  { label: 'المستوى 3: خبير', desc: 'بيحلل آخر 3 حركات ويتوقع نمطك بدقة أعلى', target: 4, scorePerWin: 80 },
];

export default function RpsAi({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [levelWon, setLevelWon] = useState(false);
  const history = useRef<Choice[]>([]);

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

  function getAiChoice(lvl: number): Choice {
    const all: Choice[] = ['rock', 'paper', 'scissors'];
    if (lvl === 0 || history.current.length < 2) {
      return all[Math.floor(Math.random() * 3)];
    }
    if (lvl === 1) {
      // يتوقع أكتر اختيار تكرر عند اللاعب ويلعب اللي يهزمه
      const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
      history.current.forEach((c) => counts[c]++);
      const mostFrequent = (Object.keys(counts) as Choice[]).sort((a, b) => counts[b] - counts[a])[0];
      return Math.random() < 0.65 ? LOSES_TO[mostFrequent] : all[Math.floor(Math.random() * 3)];
    }
    // lvl 2: يحلل آخر حركتين كنمط
    const last = history.current[history.current.length - 1];
    return Math.random() < 0.75 ? LOSES_TO[last] : all[Math.floor(Math.random() * 3)];
  }

  function playGame(choice: Choice) {
    if (levelIndex === null || playerChoice) return;
    setPlayerChoice(choice);
    const aiSelection = getAiChoice(levelIndex);

    setTimeout(() => {
      setAiChoice(aiSelection);
      history.current.push(choice);

      let gameResult: 'win' | 'lose' | 'draw';
      if (choice === aiSelection) gameResult = 'draw';
      else if (BEATS[choice] === aiSelection) gameResult = 'win';
      else gameResult = 'lose';

      setResult(gameResult);

      if (gameResult === 'win') {
        const points = LEVELS[levelIndex].scorePerWin;
        const newScore = score + points;
        setScore(newScore);
        const newWins = wins + 1;
        setWins(newWins);
        if (newWins >= LEVELS[levelIndex].target) {
          setLevelWon(true);
          submitScore(newScore, levelIndex);
          setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
        }
      }
    }, 600);
  }

  function resetRound() {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
  }

  function startLevel(idx: number) {
    setLevelIndex(idx);
    setScore(0);
    setWins(0);
    setLevelWon(false);
    history.current = [];
    resetRound();
  }

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">حجر، ورقة، مقص</h1>
          <p className="text-gray-600">اختر المستوى — كل ذكاء اصطناعي أذكى وأصعب توقعه من اللي قبله.</p>
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
                  <p className="text-sm text-gray-500">{l.desc} — تحتاج {l.target} انتصارات</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Brain className="text-brand-royal" size={26} />}
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
        <div className="flex justify-center gap-12 mb-12">
          <div className="text-center">
            <p className="text-gray-500 font-bold mb-1">النقاط</p>
            <div className="text-4xl font-black text-brand-navy">{score}</div>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-gray-500 font-bold mb-1">الانتصارات</p>
            <div className="text-4xl font-black text-brand-royal">{wins} / {LEVELS[levelIndex].target}</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-slate-50 p-8 rounded-2xl relative min-h-[300px]">
          <div className="text-center z-10">
            <h3 className="text-xl font-bold text-brand-navy mb-4">أنت</h3>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${playerChoice ? choices.find((c) => c.id === playerChoice)?.color : 'bg-gray-200'} text-white`}>
              {playerChoice ? React.createElement(choices.find((c) => c.id === playerChoice)!.icon, { className: 'w-16 h-16' }) : <span className="text-gray-400 text-xl font-bold">اختر</span>}
            </div>
          </div>

          <div className="my-8 md:my-0 w-16 h-16 bg-brand-royal text-white font-black text-2xl rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white">VS</div>

          <div className="text-center z-10">
            <h3 className="text-xl font-bold text-brand-navy mb-4">الذكاء الاصطناعي</h3>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${aiChoice ? choices.find((c) => c.id === aiChoice)?.color : 'bg-slate-800'} text-white`}>
              {aiChoice ? React.createElement(choices.find((c) => c.id === aiChoice)!.icon, { className: 'w-16 h-16' }) : <span className="text-slate-600 text-4xl animate-pulse">?</span>}
            </div>
          </div>

          {result && !levelWon && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 animate-fade-in">
              <div className={`text-5xl font-black mb-6 ${result === 'win' ? 'text-green-500' : result === 'lose' ? 'text-red-500' : 'text-gray-500'}`}>
                {result === 'win' ? 'لقد فزت! 🎉' : result === 'lose' ? 'لقد خسرت 😢' : 'تعادل 🤝'}
              </div>
              <button onClick={resetRound} className="px-8 py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
                العب الجولة التالية
              </button>
            </div>
          )}

          {levelWon && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 animate-fade-in">
              <div className="text-3xl font-black text-emerald-600 mb-6">فزت بالمستوى! 🏆</div>
              <button onClick={() => setLevelIndex(null)} className="px-8 py-3 bg-brand-royal text-white rounded-xl font-bold hover:bg-brand-navy transition-colors shadow-lg flex items-center gap-2">
                <Play size={18} /> قائمة المستويات
              </button>
            </div>
          )}
        </div>

        {!levelWon && (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-700 mb-6">اختر سلاحك</h3>
            <div className="flex justify-center gap-4 md:gap-8">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => playGame(choice.id as Choice)}
                  disabled={playerChoice !== null}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all ${playerChoice !== null ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-2 hover:shadow-xl cursor-pointer'}`}
                >
                  <div className={`w-20 h-20 ${choice.color} text-white rounded-full flex items-center justify-center shadow-lg`}>
                    <choice.icon className="w-10 h-10" />
                  </div>
                  <span className="font-bold text-gray-700">{choice.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
