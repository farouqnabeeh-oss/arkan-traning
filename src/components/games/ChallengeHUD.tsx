'use client';

import React from 'react';
import { Clock, Lightbulb, Trophy, RotateCcw } from 'lucide-react';

export function ChallengeHUD({
  timeLeft, timeLimitSeconds, hintsRevealed, totalHints, onHint, score, level, difficulty,
}: {
  timeLeft: number; timeLimitSeconds: number; hintsRevealed: number; totalHints: number;
  onHint: () => void; score: number; level: number; difficulty: string;
}) {
  const pct = (timeLeft / timeLimitSeconds) * 100;
  const urgent = pct < 25;

  const diffLabel: Record<string, string> = { EASY: 'سهل', MEDIUM: 'متوسط', HARD: 'صعب' };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 glass-dark border border-white/5 rounded-2xl font-tajawal">
      <div className="flex items-center gap-2">
        <Clock size={16} className={urgent ? 'text-red-400 animate-pulse' : 'text-brand-royal-light'} />
        <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${urgent ? 'bg-red-400' : 'royal-gradient'}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-sm font-bold tabular-nums ${urgent ? 'text-red-400' : 'text-brand-white'}`}>{timeLeft}s</span>
      </div>

      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-royal/15 text-brand-royal-light font-bold">
        المستوى {level} · {diffLabel[difficulty] || difficulty}
      </span>

      <button
        onClick={onHint}
        disabled={hintsRevealed >= totalHints}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Lightbulb size={13} /> تلميح ({hintsRevealed}/{totalHints})
      </button>

      <div className="flex items-center gap-1.5 text-sm font-bold text-brand-white">
        <Trophy size={15} className="text-brand-royal-light" /> {score}
      </div>
    </div>
  );
}

export function ChallengeResult({
  won, score, onRetry, message,
}: { won: boolean; score: number; onRetry: () => void; message: string; }) {
  return (
    <div className="text-center py-12 space-y-4 font-tajawal">
      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${won ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
        <Trophy className={won ? 'text-emerald-400' : 'text-red-400'} size={28} />
      </div>
      <h3 className="text-xl font-black text-brand-white">{won ? 'أحسنت! 🎉' : 'انتهى الوقت'}</h3>
      <p className="text-brand-white/50 text-sm">{message}</p>
      {won && <p className="text-brand-royal-light font-black text-2xl">+{score} نقطة</p>}
      <button onClick={onRetry} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity">
        <RotateCcw size={16} /> تحدٍ جديد
      </button>
    </div>
  );
}
