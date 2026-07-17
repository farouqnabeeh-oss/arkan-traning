'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, CheckCircle2, XCircle, Loader2, Trophy, Lock } from 'lucide-react';

interface Question { id: string; questionText: string; options: string[]; points: number; }
interface Exam { id: string; title: string; passingScore: number; questions: Question[]; }

export default function FinalExamPlayer({
  courseSlug, courseTitle, exam, isCourseCompleted, alreadyPassed, previousAttemptsCount,
}: {
  courseSlug: string; courseTitle: string; exam: Exam;
  isCourseCompleted: boolean; alreadyPassed: boolean; previousAttemptsCount: number;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; isPassed: boolean; verificationId: string | null } | null>(null);

  if (!isCourseCompleted) {
    return (
      <div className="text-center py-24 space-y-4">
        <Lock className="w-12 h-12 text-brand-white/20 mx-auto" />
        <h1 className="text-2xl font-tajawal font-black text-brand-white">لسه ما خلصت كل الدروس</h1>
        <p className="text-brand-white/50 font-tajawal text-sm">لازم تكمل مشاهدة كل دروس دورة "{courseTitle}" قبل ما تقدر تقدّم الامتحان النهائي.</p>
        <Link href={`/courses/${courseSlug}`} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
          رجوع للدورة
        </Link>
      </div>
    );
  }

  if (alreadyPassed && !result) {
    return (
      <div className="text-center py-24 space-y-4">
        <Trophy className="w-14 h-14 text-emerald-400 mx-auto" />
        <h1 className="text-2xl font-tajawal font-black text-brand-white">اجتزت هذا الامتحان بالفعل! 🎉</h1>
        <p className="text-brand-white/50 font-tajawal text-sm">شهادتك جاهزة، تقدر تشوفها من حسابك.</p>
        <Link href="/dashboard/settings" className="royal-gradient text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
          عرض شهاداتي
        </Link>
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await fetch('/api/player/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: exam.id, answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    setResult({ score: data.score, isPassed: data.isPassed, verificationId: data.verificationId });
  }

  if (result) {
    return (
      <div className="text-center py-16 space-y-5">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-black ${result.isPassed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {result.score}%
        </div>
        <h1 className="text-2xl font-tajawal font-black text-brand-white">
          {result.isPassed ? 'مبروك! اجتزت الامتحان 🎉' : 'للأسف، ما وصلت لنسبة النجاح'}
        </h1>
        <p className="text-brand-white/50 font-tajawal text-sm max-w-md mx-auto">
          {result.isPassed
            ? 'شهادتك جاهزة الآن ومتاحة من حسابك.'
            : `تحتاج ${exam.passingScore}% للنجاح. راجع الدروس وحاول مرة أخرى.`}
        </p>
        {result.isPassed && result.verificationId ? (
          <Link href={`/certificates/${result.verificationId}`} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
            عرض شهادتي
          </Link>
        ) : (
          <button onClick={() => { setResult(null); setAnswers({}); }} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  const allAnswered = exam.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <GraduationCap className="w-10 h-10 text-brand-royal-light mx-auto" />
        <h1 className="text-2xl md:text-3xl font-tajawal font-black text-brand-white">{exam.title}</h1>
        <p className="text-brand-white/50 font-tajawal text-sm">
          نسبة النجاح المطلوبة: {exam.passingScore}% · {exam.questions.length} سؤال
          {previousAttemptsCount > 0 && ` · حاولت ${previousAttemptsCount} مرة سابقًا`}
        </p>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, qIdx) => (
          <div key={q.id} className="glass-dark border border-white/5 rounded-2xl p-6 space-y-3">
            <h3 className="font-tajawal font-bold text-brand-white flex items-start gap-2">
              <span className="text-brand-royal-light">{qIdx + 1}.</span> {q.questionText}
            </h3>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm font-tajawal transition-all ${
                    answers[q.id] === String(optIdx) ? 'border-brand-royal bg-brand-royal/10 text-brand-white' : 'border-white/5 text-brand-white/60 hover:bg-white/5'
                  }`}
                >
                  <input type="radio" className="hidden" checked={answers[q.id] === String(optIdx)} onChange={() => setAnswers((a) => ({ ...a, [q.id]: String(optIdx) }))} />
                  {answers[q.id] === String(optIdx) ? <CheckCircle2 size={16} className="text-brand-royal-light shrink-0" /> : <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" />}
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full royal-gradient text-white font-tajawal font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
        {allAnswered ? 'تسليم الامتحان' : `أجب على كل الأسئلة (${Object.keys(answers).length}/${exam.questions.length})`}
      </button>
    </div>
  );
}
