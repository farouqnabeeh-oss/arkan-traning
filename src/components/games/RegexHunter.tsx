'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle } from 'lucide-react';
import { useGameChallenge } from './useGameChallenge';
import { ChallengeHUD, ChallengeResult } from './ChallengeHUD';

interface Props { user: any; gameSlug: string; }

interface Round {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  prompt: string;
  matches: string[];
  nonMatches: string[];
  hints: string[];
  baseScore: number;
}

const ROUNDS: Round[] = [
  {
    difficulty: 'EASY', timeLimit: 60, baseScore: 100,
    prompt: 'اكتب نمطًا يطابق أي رقم هاتف مكوّن من 10 أرقام فقط (بدون رموز أو مسافات).',
    matches: ['0567777296', '1234567890'],
    nonMatches: ['05677772', 'abc1234567', '056-777-729'],
    hints: ['استخدم \\d للدلالة على رقم واحد', 'استخدم {10} لتكرار النمط 10 مرات', 'الحل: ^\\d{10}$'],
  },
  {
    difficulty: 'MEDIUM', timeLimit: 50, baseScore: 150,
    prompt: 'اكتب نمطًا يطابق بريدًا إلكترونيًا بسيطًا (نص@نص.نص).',
    matches: ['ahmad@gmail.com', 'test@arkan.edu'],
    nonMatches: ['ahmad@gmail', '@gmail.com', 'ahmad.com'],
    hints: ['استخدم + بعد الفئة المحرفية للسماح بأكثر من حرف', 'لا تنسَ @ ثم النطاق ثم نقطة', 'الحل التقريبي: ^\\S+@\\S+\\.\\S+$'],
  },
  {
    difficulty: 'HARD', timeLimit: 45, baseScore: 200,
    prompt: 'اكتب نمطًا يطابق كلمة مرور قوية: 8 أحرف على الأقل، فيها حرف كبير ورقم واحد على الأقل.',
    matches: ['Arkan2026', 'Passw0rd'],
    nonMatches: ['arkan2026', 'PASSWORD', 'Arkan'],
    hints: ['استخدم Lookahead: (?=...)', 'مثال: (?=.*[A-Z])(?=.*\\d)', 'الحل: ^(?=.*[A-Z])(?=.*\\d).{8,}$'],
  },
];

export default function RegexHunter({ user, gameSlug }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [pattern, setPattern] = useState('');
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost' | 'gameOver'>('idle');
  const [totalScore, setTotalScore] = useState(0);
  const [totalHints, setTotalHints] = useState(0);
  const [testResults, setTestResults] = useState<{ text: string; expected: boolean; actual: boolean }[]>([]);

  const round = ROUNDS[roundIndex];
  const challenge = useGameChallenge({
    timeLimitSeconds: round.timeLimit,
    hints: round.hints,
    onTimeUp: () => setStatus('lost'),
  });

  function startRound() {
    setPattern('');
    setTestResults([]);
    setStatus('playing');
    challenge.start();
  }

  function submitScoreToServer(finalScore: number, hintsUsed: number) {
    if (!user) return;
    fetch('/api/games/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameSlug, score: finalScore, level: roundIndex + 1, hintsUsed, timeTakenSecs: challenge.timeTakenSecs }),
    }).catch(() => {});
  }

  function checkPattern() {
    challenge.stop();
    let regex: RegExp;
    try {
      regex = new RegExp(pattern);
    } catch {
      setTestResults([{ text: 'صيغة Regex غير صحيحة', expected: true, actual: false }]);
      setStatus('lost');
      return;
    }

    const results = [
      ...round.matches.map((t) => ({ text: t, expected: true, actual: regex.test(t) })),
      ...round.nonMatches.map((t) => ({ text: t, expected: false, actual: regex.test(t) })),
    ];
    setTestResults(results);

    const allPassed = results.every((r) => r.expected === r.actual);
    if (allPassed) {
      const score = challenge.computeScore(round.baseScore);
      setTotalScore((s) => s + score);
      setTotalHints((h) => h + challenge.hintsRevealed);
      setStatus('won');
    } else {
      setStatus('lost');
    }
  }

  function nextOrFinish() {
    if (roundIndex < ROUNDS.length - 1) {
      setRoundIndex((i) => i + 1);
      setStatus('idle');
    } else {
      submitScoreToServer(totalScore, totalHints);
      setStatus('gameOver');
    }
  }

  function restart() {
    setRoundIndex(0);
    setTotalScore(0);
    setTotalHints(0);
    setStatus('idle');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-tajawal font-black text-brand-white mb-2">صياد الأنماط <span className="text-brand-royal-light">Regex</span></h1>
        <p className="text-brand-white/50 font-tajawal text-sm">اكتب تعبيرًا نمطيًا يطابق كل الأمثلة الصحيحة ويرفض الخاطئة، قبل نفاد الوقت.</p>
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
          <ChallengeHUD
            timeLeft={challenge.timeLeft} timeLimitSeconds={round.timeLimit}
            hintsRevealed={challenge.hintsRevealed} totalHints={round.hints.length}
            onHint={challenge.revealNextHint} score={totalScore} level={roundIndex + 1} difficulty={round.difficulty}
          />

          <div className="glass-dark border border-white/5 rounded-2xl p-6 space-y-5">
            <p className="text-brand-white font-tajawal font-bold">{round.prompt}</p>

            {challenge.activeHints.length > 0 && (
              <div className="space-y-1.5">
                {challenge.activeHints.map((h, i) => (
                  <p key={i} className="text-xs text-amber-400 font-tajawal">💡 {h}</p>
                ))}
              </div>
            )}

            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="^\d{10}$"
              className="input-premium w-full font-mono text-sm"
              dir="ltr"
              autoFocus
            />

            <button onClick={checkPattern} className="w-full royal-gradient text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
              تحقق من النمط
            </button>
          </div>
        </>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="space-y-6">
          <div className="glass-dark border border-white/5 rounded-2xl p-6 space-y-2">
            {testResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm font-mono">
                <span className="text-brand-white/70">{r.text}</span>
                {r.expected === r.actual ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
              </div>
            ))}
          </div>
          <ChallengeResult
            won={status === 'won'}
            score={status === 'won' ? challenge.computeScore(round.baseScore) : 0}
            message={status === 'won' ? 'نمطك يطابق كل الحالات الصحيحة!' : 'نمطك ما اجتاز كل الاختبارات، حاول مرة تانية.'}
            onRetry={status === 'won' ? nextOrFinish : startRound}
          />
        </div>
      )}

      {status === 'gameOver' && (
        <div className="text-center py-16 space-y-4">
          <h2 className="text-2xl font-tajawal font-black text-brand-white">أنهيت التحدي! 🏆</h2>
          <p className="text-brand-royal-light font-black text-4xl">{totalScore} نقطة</p>
          <button onClick={restart} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl mx-auto hover:opacity-90 transition-opacity">
            العب مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
}
