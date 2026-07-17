'use client';

import React, { useState } from 'react';
import { Play, GitBranch, X } from 'lucide-react';
import { useGameChallenge } from './useGameChallenge';
import { ChallengeHUD, ChallengeResult } from './ChallengeHUD';

interface Props { user: any; gameSlug: string; }

interface Round {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  baseScore: number;
  scenario: string;
  pool: string[];
  correctSequence: string[];
  hints: string[];
}

const ROUNDS: Round[] = [
  {
    difficulty: 'EASY', timeLimit: 50, baseScore: 100,
    scenario: 'عندك تعديلات جديدة على ملفاتك، بدك ترفعها للمستودع البعيد. رتّب الأوامر بالترتيب الصحيح.',
    pool: ['git push', 'git commit -m "update"', 'git add .', 'git status'],
    correctSequence: ['git status', 'git add .', 'git commit -m "update"', 'git push'],
    hints: ['أول شي دايمًا نتفحص حالة الملفات', 'بعدها نجهز الملفات للحفظ (add)', 'الترتيب: status → add → commit → push'],
  },
  {
    difficulty: 'MEDIUM', timeLimit: 45, baseScore: 150,
    scenario: 'بدك تنشئ فرع (branch) جديد وتنتقل إليه وتبدأ الشغل عليه.',
    pool: ['git checkout new-feature', 'git branch new-feature', 'git add .', 'git commit -m "start feature"'],
    correctSequence: ['git branch new-feature', 'git checkout new-feature', 'git add .', 'git commit -m "start feature"'],
    hints: ['أول شي ننشئ الفرع بـ branch', 'بعدها ننتقل له بـ checkout', 'الترتيب: branch → checkout → add → commit'],
  },
  {
    difficulty: 'HARD', timeLimit: 40, baseScore: 200,
    scenario: 'عملت تعديل غلط وبدك ترجع لآخر نسخة محفوظة (commit) بدون ما تفقد الفرع.',
    pool: ['git log', 'git reset --hard HEAD', 'git status', 'git checkout main'],
    correctSequence: ['git status', 'git log', 'git reset --hard HEAD', 'git checkout main'],
    hints: ['أول شي نتأكد شو التغييرات الموجودة', 'log بيوريك تاريخ الـ commits', 'reset --hard HEAD بيرجعك لآخر حفظ'],
  },
];

export default function GitRace({ user, gameSlug }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost' | 'gameOver'>('idle');
  const [totalScore, setTotalScore] = useState(0);
  const [totalHints, setTotalHints] = useState(0);

  const round = ROUNDS[roundIndex];
  const challenge = useGameChallenge({ timeLimitSeconds: round.timeLimit, hints: round.hints, onTimeUp: () => setStatus('lost') });

  function startRound() {
    setSequence([]);
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

  function addCommand(cmd: string) {
    if (sequence.length >= round.correctSequence.length) return;
    const next = [...sequence, cmd];
    setSequence(next);
    if (next.length === round.correctSequence.length) {
      challenge.stop();
      const correct = next.every((c, i) => c === round.correctSequence[i]);
      if (correct) {
        const score = challenge.computeScore(round.baseScore);
        setTotalScore((s) => s + score);
        setTotalHints((h) => h + challenge.hintsRevealed);
        setStatus('won');
      } else {
        setStatus('lost');
      }
    }
  }

  function removeLast() { setSequence((s) => s.slice(0, -1)); }

  function nextOrFinish() {
    if (roundIndex < ROUNDS.length - 1) { setRoundIndex((i) => i + 1); setStatus('idle'); }
    else { submitScoreToServer(totalScore, totalHints); setStatus('gameOver'); }
  }

  function restart() { setRoundIndex(0); setTotalScore(0); setTotalHints(0); setStatus('idle'); }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-tajawal font-black text-brand-white mb-2">سباق <span className="text-brand-royal-light">Git</span></h1>
        <p className="text-brand-white/50 font-tajawal text-sm">رتّب أوامر Git بالتسلسل الصحيح لحل السيناريو قبل نفاد الوقت.</p>
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
            <p className="text-brand-white font-tajawal font-bold">{round.scenario}</p>

            {challenge.activeHints.length > 0 && (
              <div className="space-y-1.5">{challenge.activeHints.map((h, i) => <p key={i} className="text-xs text-amber-400 font-tajawal">💡 {h}</p>)}</div>
            )}

            <div className="min-h-[3rem] flex flex-wrap gap-2 p-3 bg-black/20 rounded-xl border border-white/5">
              {sequence.length === 0 && <span className="text-xs text-brand-white/30 font-tajawal">اضغط الأوامر بالأسفل بالترتيب الصحيح...</span>}
              {sequence.map((cmd, i) => (
                <span key={i} className="text-xs font-mono bg-brand-royal/20 text-brand-royal-light px-2.5 py-1.5 rounded-lg">{i + 1}. {cmd}</span>
              ))}
              {sequence.length > 0 && (
                <button onClick={removeLast} className="text-xs text-red-400/70 hover:text-red-400 px-2"><X size={14} /></button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {round.pool.map((cmd) => (
                <button key={cmd} onClick={() => addCommand(cmd)} disabled={sequence.length >= round.correctSequence.length} className="text-right p-3 rounded-xl bg-white/5 hover:bg-brand-royal/10 border border-transparent hover:border-brand-royal/30 transition-colors font-mono text-xs text-brand-white/80 disabled:opacity-30" dir="ltr">
                  {cmd}
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
          message={status === 'won' ? 'تسلسل صحيح تمامًا!' : `التسلسل الصحيح: ${round.correctSequence.join(' ← ')}`}
          onRetry={status === 'won' ? nextOrFinish : startRound}
        />
      )}

      {status === 'gameOver' && (
        <div className="text-center py-16 space-y-4">
          <GitBranch className="w-10 h-10 text-brand-royal-light mx-auto" />
          <h2 className="text-2xl font-tajawal font-black text-brand-white">أنهيت السباق! 🏆</h2>
          <p className="text-brand-royal-light font-black text-4xl">{totalScore} نقطة</p>
          <button onClick={restart} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl mx-auto hover:opacity-90 transition-opacity">العب مرة أخرى</button>
        </div>
      )}
    </div>
  );
}
