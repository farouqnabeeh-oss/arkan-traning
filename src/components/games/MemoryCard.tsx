"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Lock, LayoutGrid } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

const ALL_TERMS = [
  'React', 'Next.js', 'Tailwind', 'TypeScript', 'Prisma', 'Node.js',
  'GraphQL', 'Docker', 'Git', 'MongoDB', 'Python', 'Redux',
];

const LEVELS = [
  { pairs: 6, cols: 'grid-cols-3 md:grid-cols-4', label: 'المستوى 1', desc: '6 أزواج' },
  { pairs: 8, cols: 'grid-cols-4', label: 'المستوى 2', desc: '8 أزواج' },
  { pairs: 10, cols: 'grid-cols-4 md:grid-cols-5', label: 'المستوى 3', desc: '10 أزواج' },
];

interface Card { id: number; content: string; isFlipped: boolean; isMatched: boolean; uniqueId: string; }

export default function MemoryCard({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState(1);

  const initializeGame = useCallback((idx: number) => {
    const pairsCount = LEVELS[idx].pairs;
    const terms = ALL_TERMS.slice(0, pairsCount).map((content, id) => ({ id, content }));
    const duplicated = [...terms, ...terms].map((card) => ({
      ...card, isFlipped: false, isMatched: false, uniqueId: Math.random().toString(36).substring(7),
    }));
    setCards(duplicated.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setIsLocked(false);
  }, []);

  function startLevel(idx: number) {
    setLevelIndex(idx);
    initializeGame(idx);
  }

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

  function handleCardClick(index: number) {
    if (isLocked || levelIndex === null) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);
      const [a, b] = newFlipped;

      if (cards[a].id === cards[b].id) {
        setTimeout(() => {
          const matched = [...cards];
          matched[a].isMatched = true;
          matched[b].isMatched = true;
          setCards(matched);
          setFlippedCards([]);
          setIsLocked(false);
          const newScore = score + 20;
          setScore(newScore);

          if (matched.every((c) => c.isMatched)) {
            const finalScore = newScore + Math.max(0, 150 - moves * 5);
            submitScore(finalScore, levelIndex);
            setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
          }
        }, 500);
      } else {
        setTimeout(() => {
          const un = [...cards];
          un[a].isFlipped = false;
          un[b].isFlipped = false;
          setCards(un);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }

  const isWon = cards.length > 0 && cards.every((c) => c.isMatched);

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">لعبة الذاكرة</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى فيه أزواج أكتر وتحدي أصعب.</p>
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
                {locked ? <Lock className="text-gray-400" size={22} /> : <LayoutGrid className="text-brand-royal" size={26} />}
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
        <p className="text-gray-600">طابق البطاقات المتشابهة بأقل عدد ممكن من الحركات.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-royal/20">
        <div className="flex justify-between items-center mb-8 px-4 bg-slate-50 p-4 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-gray-500 font-bold mb-1">الحركات</p>
            <p className="text-2xl font-black text-brand-navy">{moves}</p>
          </div>
          {isWon && (
            <div className="text-center animate-bounce">
              <p className="text-brand-royal font-bold text-xl">اكتمل التحدي! 🎉</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-gray-500 font-bold mb-1">النقاط</p>
            <p className="text-2xl font-black text-brand-royal">{score}</p>
          </div>
        </div>

        <div className={`grid ${LEVELS[levelIndex].cols} gap-4 perspective-1000`}>
          {cards.map((card, index) => (
            <div
              key={card.uniqueId}
              onClick={() => handleCardClick(index)}
              className={`relative w-full h-28 md:h-36 cursor-pointer transition-transform duration-500 transform-style-3d ${
                card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
              }`}
            >
              <div className={`absolute w-full h-full backface-hidden bg-brand-navy rounded-xl shadow-md border-2 border-brand-royal/30 flex items-center justify-center p-4 ${
                card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'
              } transition-opacity duration-300`}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">?</span>
                </div>
              </div>
              <div className={`absolute w-full h-full backface-hidden rotate-y-180 ${
                card.isMatched ? 'bg-green-100 border-green-500' : 'bg-white border-brand-royal'
              } rounded-xl shadow-lg border-2 flex items-center justify-center p-3 ${
                card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-300`}>
                <span className={`text-sm md:text-lg font-bold text-center ${card.isMatched ? 'text-green-700' : 'text-brand-navy'}`}>
                  {card.content}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={() => initializeGame(levelIndex)} className="px-6 py-3 bg-white border-2 border-brand-royal/30 text-brand-navy rounded-xl font-bold transition-colors flex items-center gap-2">
            إعادة المستوى <RotateCcw className="w-4 h-4" />
          </button>
          {isWon && (
            <button onClick={() => setLevelIndex(null)} className="px-6 py-3 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" /> المستوى التالي
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
