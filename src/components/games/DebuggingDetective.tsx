'use client';

import React, { useState } from 'react';
import { Play, Bug } from 'lucide-react';
import { useGameChallenge } from './useGameChallenge';
import { ChallengeHUD, ChallengeResult } from './ChallengeHUD';

interface Props { user: any; gameSlug: string; }

interface Round {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  baseScore: number;
  description: string;
  code: string[];
  buggyLine: number;
  hints: string[];
}

const ROUNDS: Round[] = [
  {
    difficulty: 'EASY', timeLimit: 40, baseScore: 100,
    description: 'الدالة المفروض ترجع مجموع رقمين، بس فيها خطأ. لاقي السطر.',
    code: [
      'function sum(a, b) {',
      '  let result = a - b;',
      '  return result;',
      '}',
    ],
    buggyLine: 1,
    hints: ['اسم الدالة sum يعني جمع مش طرح', 'راقب العملية الحسابية بالسطر الثاني', 'الخطأ بالسطر: let result = a - b;'],
  },
  {
    difficulty: 'MEDIUM', timeLimit: 35, baseScore: 150,
    description: 'حلقة تكرارية المفروض تطبع من 0 لـ 4، بس فيها خطأ منطقي.',
    code: [
      'for (let i = 0; i <= 5; i++) {',
      '  console.log(i);',
      '}',
    ],
    buggyLine: 0,
    hints: ['تأكد من شرط توقف الحلقة (condition)', 'i <= 5 بتطبع 6 أرقام مش 5', 'الخطأ بالسطر: for (let i = 0; i <= 5; i++)'],
  },
  {
    difficulty: 'HARD', timeLimit: 30, baseScore: 200,
    description: 'دالة بتتحقق من طالب ناجح إذا علامته 60 فأكثر، بس فيها خطأ بالمقارنة.',
    code: [
      'function isPassed(grade) {',
      '  if (grade = 60) {',
      '    return true;',
      '  }',
      '  return grade > 60;',
      '}',
    ],
    buggyLine: 1,
    hints: ['فرق بين = و == و ===', 'إشارة = وحدة بتسند قيمة مش تقارن', 'الخطأ بالسطر: if (grade = 60)'],
  },
];

export default function DebuggingDetective({ user, gameSlug }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost' | 'gameOver'>('idle');
  const [totalScore, setTotalScore] = useState(0);
  const [totalHints, setTotalHints] = useState(0);

  const round = ROUNDS[roundIndex];
  const challenge = useGameChallenge({ timeLimitSeconds: round.timeLimit, hints: round.hints, onTimeUp: () => setStatus('lost') });

  function startRound() {
    setSelectedLine(null);
    setStatus('playing');
    challenge.start();
  }

  function submitScoreToServer(finalScore: number, hintsUsed: number) {
    if (!user) return;
    fetch('/api/games/score', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameSlug, score: finalScore, level: roundIndex + 1, hintsUsed, timeTakenSecs: challenge.timeTakenSecs }),
    }).catch(() => {});
  }

  function selectLine(idx: number) {
    setSelectedLine(idx);
    challenge.stop();
    if (idx === round.buggyLine) {
      const score = challenge.computeScore(round.baseScore);
      setTotalScore((s) => s + score);
      setTotalHints((h) => h + challenge.hintsRevealed);
      setStatus('won');
    } else {
      setStatus('lost');
    }
  }

  function nextOrFinish() {
    if (roundIndex < ROUNDS.length - 1) { setRoundIndex((i) => i + 1); setStatus('idle'); }
    else { submitScoreToServer(totalScore, totalHints); setStatus('gameOver'); }
  }

  function restart() { setRoundIndex(0); setTotalScore(0); setTotalHints(0); setStatus('idle'); }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-tajawal font-black text-brand-white mb-2">محقق <span className="text-brand-royal-light">الأخطاء</span></h1>
        <p className="text-brand-white/50 font-tajawal text-sm">اضغط على السطر المسبب للخطأ قبل نفاد الوقت.</p>
      </div>

      {status === 'idle' && (
        <div className="text-center py-16">
          <button onClick={startRound} className="royal-gradient text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity">
            <Play size={18} /> {roundIndex === 0 ? 'ابدأ التحدي' : `الجولة ${roundIndex + 1}`}
          </button>
        </div>
      )}

      {status === 'playing' && (
        <>
          <ChallengeHUD timeLeft={challenge.timeLeft} timeLimitSeconds={round.timeLimit} hintsRevealed={challenge.hintsRevealed} totalHints={round.hints.length} onHint={challenge.revealNextHint} score={totalScore} level={roundIndex + 1} difficulty={round.difficulty} />

          <div className="glass-dark border border-white/5 rounded-2xl p-6 space-y-5">
            <p className="text-brand-white font-tajawal font-bold">{round.description}</p>

            {challenge.activeHints.length > 0 && (
              <div className="space-y-1.5">{challenge.activeHints.map((h, i) => <p key={i} className="text-xs text-amber-400 font-tajawal">💡 {h}</p>)}</div>
            )}

            <div className="bg-black/30 rounded-xl overflow-hidden border border-white/5 font-mono text-sm" dir="ltr">
              {round.code.map((line, i) => (
                <button
                  key={i}
                  onClick={() => selectLine(i)}
                  className="w-full text-left px-4 py-2 hover:bg-brand-royal/15 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-brand-white/30 select-none w-5">{i + 1}</span>
                  <span className="text-brand-white/80">{line}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(status === 'won' || status === 'lost') && (
        <ChallengeResult
          won={status === 'won'}
          score={status === 'won' ? challenge.computeScore(round.baseScore) : 0}
          message={status === 'won' ? 'لقطة! هذا هو السطر الخاطئ.' : `السطر الصحيح كان: ${round.code[round.buggyLine]}`}
          onRetry={status === 'won' ? nextOrFinish : startRound}
        />
      )}

      {status === 'gameOver' && (
        <div className="text-center py-16 space-y-4">
          <Bug className="w-10 h-10 text-brand-royal-light mx-auto" />
          <h2 className="text-2xl font-tajawal font-black text-brand-white">حللت كل القضايا! 🏆</h2>
          <p className="text-brand-royal-light font-black text-4xl">{totalScore} نقطة</p>
          <button onClick={restart} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl mx-auto hover:opacity-90 transition-opacity">العب مرة أخرى</button>
        </div>
      )}
    </div>
  );
}
