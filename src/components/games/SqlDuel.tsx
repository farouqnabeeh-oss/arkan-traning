'use client';

import React, { useState } from 'react';
import { Play, Database } from 'lucide-react';
import { useGameChallenge } from './useGameChallenge';
import { ChallengeHUD, ChallengeResult } from './ChallengeHUD';

interface Props { user: any; gameSlug: string; }

interface Round {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  baseScore: number;
  prompt: string;
  table: { headers: string[]; rows: string[][] };
  options: string[];
  correctIndex: number;
  hints: string[];
}

const ROUNDS: Round[] = [
  {
    difficulty: 'EASY', timeLimit: 40, baseScore: 100,
    prompt: 'اكتب الاستعلام الصحيح لجلب كل الطلاب من جدول students الذين مستواهم "متقدم".',
    table: { headers: ['id', 'name', 'level'], rows: [['1', 'أحمد', 'متقدم'], ['2', 'سارة', 'مبتدئ']] },
    options: [
      "SELECT * FROM students WHERE level = 'متقدم';",
      "SELECT * FROM students;",
      "DELETE FROM students WHERE level = 'متقدم';",
      "UPDATE students SET level = 'متقدم';",
    ],
    correctIndex: 0,
    hints: ['نحتاج SELECT مش DELETE ولا UPDATE', 'استخدم WHERE للفلترة', 'الحل يحتوي على: WHERE level = \'متقدم\''],
  },
  {
    difficulty: 'MEDIUM', timeLimit: 35, baseScore: 150,
    prompt: 'اكتب الاستعلام الذي يرتب الدورات حسب السعر تنازليًا.',
    table: { headers: ['id', 'title', 'price'], rows: [['1', 'بايثون', '150'], ['2', 'React', '200']] },
    options: [
      "SELECT * FROM courses ORDER BY price ASC;",
      "SELECT * FROM courses ORDER BY price DESC;",
      "SELECT * FROM courses GROUP BY price;",
      "SELECT * FROM courses WHERE price DESC;",
    ],
    correctIndex: 1,
    hints: ['ORDER BY يستخدم للترتيب', 'DESC تعني تنازلي، ASC تصاعدي', 'الحل: ORDER BY price DESC'],
  },
  {
    difficulty: 'HARD', timeLimit: 30, baseScore: 200,
    prompt: 'اكتب الاستعلام الذي يحسب عدد الطلاب المسجلين بكل دورة.',
    table: { headers: ['course_id', 'student_id'], rows: [['1', '10'], ['1', '11'], ['2', '12']] },
    options: [
      "SELECT course_id, COUNT(*) FROM enrollments GROUP BY course_id;",
      "SELECT course_id, SUM(*) FROM enrollments;",
      "SELECT COUNT(course_id) FROM enrollments ORDER BY course_id;",
      "SELECT * FROM enrollments COUNT course_id;",
    ],
    correctIndex: 0,
    hints: ['نحتاج تجميع البيانات حسب course_id', 'COUNT(*) يحسب عدد الصفوف', 'الحل يحتاج GROUP BY course_id'],
  },
];

export default function SqlDuel({ user, gameSlug }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost' | 'gameOver'>('idle');
  const [totalScore, setTotalScore] = useState(0);
  const [totalHints, setTotalHints] = useState(0);

  const round = ROUNDS[roundIndex];
  const challenge = useGameChallenge({ timeLimitSeconds: round.timeLimit, hints: round.hints, onTimeUp: () => setStatus('lost') });

  function startRound() {
    setSelected(null);
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

  function submitAnswer(idx: number) {
    setSelected(idx);
    challenge.stop();
    if (idx === round.correctIndex) {
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
        <h1 className="text-3xl font-tajawal font-black text-brand-white mb-2">مبارزة <span className="text-brand-royal-light">SQL</span></h1>
        <p className="text-brand-white/50 font-tajawal text-sm">اختر الاستعلام الصحيح لتحقيق النتيجة المطلوبة قبل نفاد الوقت.</p>
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
            <p className="text-brand-white font-tajawal font-bold">{round.prompt}</p>

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-xs font-mono">
                <thead><tr className="bg-white/5">{round.table.headers.map((h) => <th key={h} className="p-2 text-brand-royal-light">{h}</th>)}</tr></thead>
                <tbody>{round.table.rows.map((r, i) => <tr key={i} className="border-t border-white/5">{r.map((c, j) => <td key={j} className="p-2 text-brand-white/60">{c}</td>)}</tr>)}</tbody>
              </table>
            </div>

            {challenge.activeHints.length > 0 && (
              <div className="space-y-1.5">{challenge.activeHints.map((h, i) => <p key={i} className="text-xs text-amber-400 font-tajawal">💡 {h}</p>)}</div>
            )}

            <div className="space-y-2">
              {round.options.map((opt, i) => (
                <button key={i} onClick={() => submitAnswer(i)} className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-brand-royal/10 hover:border-brand-royal/30 border border-transparent transition-colors font-mono text-xs text-brand-white/80" dir="ltr">
                  {opt}
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
          message={status === 'won' ? 'استعلام صحيح تمامًا!' : `الإجابة الصحيحة كانت: ${round.options[round.correctIndex]}`}
          onRetry={status === 'won' ? nextOrFinish : startRound}
        />
      )}

      {status === 'gameOver' && (
        <div className="text-center py-16 space-y-4">
          <Database className="w-10 h-10 text-brand-royal-light mx-auto" />
          <h2 className="text-2xl font-tajawal font-black text-brand-white">أنهيت المبارزة! 🏆</h2>
          <p className="text-brand-royal-light font-black text-4xl">{totalScore} نقطة</p>
          <button onClick={restart} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl mx-auto hover:opacity-90 transition-opacity">العب مرة أخرى</button>
        </div>
      )}
    </div>
  );
}
