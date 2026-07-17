"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw, Play, Lock, Gauge } from 'lucide-react';

interface Props {
  user: any;
  gameSlug: string;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = [0, -1];

const LEVELS = [
  { label: 'المستوى 1: بطيء', speed: 180, target: 8, desc: 'سرعة مريحة للتعلم' },
  { label: 'المستوى 2: متوسط', speed: 120, target: 12, desc: 'سرعة أعلى، ركّز أكتر' },
  { label: 'المستوى 3: سريع', speed: 75, target: 15, desc: 'تحدي حقيقي لردة فعلك' },
];

export default function PythonSnake({ user, gameSlug }: Props) {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState([5, 5]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);

  const speed = levelIndex !== null ? LEVELS[levelIndex].speed : 150;

  const generateFood = useCallback(() => {
    let newFood: [number, number] = [0, 0];
    while (true) {
      newFood = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)];
      // eslint-disable-next-line no-loop-func
      if (!snake.some((segment) => segment[0] === newFood[0] && segment[1] === newFood[1])) break;
    }
    setFood(newFood);
  }, [snake]);

  const submitScore = useCallback(async (finalScore: number, lvl: number) => {
    if (!user) return;
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug, score: finalScore * 10, level: lvl + 1 }),
      });
    } catch (error) { console.error('Failed to submit score', error); }
  }, [user, gameSlug]);

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    if (levelIndex !== null) {
      submitScore(score, levelIndex);
      if (score >= LEVELS[levelIndex].target) {
        setLevelCleared(true);
        setUnlockedLevels((u) => Math.max(u, levelIndex + 2));
      }
    }
  }, [levelIndex, score, submitScore]);

  const moveSnake = useCallback(() => {
    if (!isPlaying) return;
    setSnake((prev) => {
      const newHead = [prev[0][0] + direction[0], prev[0][1] + direction[1]];
      if (newHead[0] < 0 || newHead[0] >= GRID_SIZE || newHead[1] < 0 || newHead[1] >= GRID_SIZE) {
        endGame();
        return prev;
      }
      if (prev.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])) {
        endGame();
        return prev;
      }
      const newSnake = [newHead, ...prev];
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore((s) => s + 1);
        generateFood();
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [direction, food, isPlaying, generateFood, endGame]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': if (direction[1] !== 1) setDirection([0, -1]); break;
        case 'ArrowDown': if (direction[1] !== -1) setDirection([0, 1]); break;
        case 'ArrowLeft': if (direction[0] !== 1) setDirection([-1, 0]); break;
        case 'ArrowRight': if (direction[0] !== -1) setDirection([1, 0]); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [moveSnake, speed]);

  function startGame(idx?: number) {
    if (idx !== undefined) setLevelIndex(idx);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setLevelCleared(false);
    setIsPlaying(true);
    generateFood();
  }

  if (levelIndex === null) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl" dir="rtl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-navy mb-3">ثعبان بايثون</h1>
          <p className="text-gray-600">اختر المستوى — كل مستوى أسرع من اللي قبله ويحتاج نقاط أكتر.</p>
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
                  <p className="text-sm text-gray-500">{l.desc} — الهدف: {l.target} نقطة</p>
                </div>
                {locked ? <Lock className="text-gray-400" size={22} /> : <Gauge className="text-brand-royal" size={26} />}
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
        <p className="text-gray-600 text-sm">الهدف: {LEVELS[levelIndex].target} نقطة للفوز بالمستوى</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-brand-royal/20 flex flex-col md:flex-row gap-12 items-center justify-center">
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-brand-navy/20">
            <Trophy className="w-12 h-12 text-brand-royal" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy mb-2">النقاط</h2>
          <div className="text-6xl font-black text-brand-royal mb-8">{score * 10}</div>

          {gameOver && (
            <div className="w-full animate-fade-in-up space-y-3">
              <div className={`font-bold p-4 rounded-xl ${levelCleared ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {levelCleared ? `فزت بالمستوى! 🎉 (${score} نقطة)` : `انتهت اللعبة — جمعت ${score} من ${LEVELS[levelIndex].target}`}
              </div>
              <button onClick={() => startGame()} className="w-full py-3.5 bg-brand-royal hover:bg-brand-navy text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl">
                حاول مرة أخرى <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={() => setLevelIndex(null)} className="w-full py-3.5 bg-white border-2 border-brand-navy/20 text-brand-navy rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> قائمة المستويات
              </button>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="font-bold mb-2">طريقة اللعب:</p>
            <p>استخدم أسهم لوحة المفاتيح لتحريك الثعبان.</p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl relative">
          <div className="grid bg-slate-800" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`, gap: '1px' }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some((segment) => segment[0] === x && segment[1] === y);
              const isHead = snake[0][0] === x && snake[0][1] === y;
              const isFood = food[0] === x && food[1] === y;
              return (
                <div key={i} className={`w-5 h-5 ${isHead ? 'bg-brand-royal rounded-sm z-10 scale-110' : isSnake ? 'bg-brand-royal/80 rounded-sm' : isFood ? 'bg-red-500 rounded-full scale-75 animate-pulse' : 'bg-slate-900/50'}`} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
