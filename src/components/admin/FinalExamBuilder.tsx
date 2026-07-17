'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react';

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: string; // index كنص "0", "1"...
  points: string;
}

const emptyQuestion = (): QuestionForm => ({ questionText: '', options: ['', '', '', ''], correctAnswer: '0', points: '10' });

export default function FinalExamBuilder({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('الامتحان النهائي');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [hasExam, setHasExam] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}/final-exam`).then((r) => r.json()).then((d) => {
      if (d.exam) {
        setHasExam(true);
        setTitle(d.exam.title);
        setPassingScore(d.exam.passingScore.toString());
        setQuestions(
          d.exam.questions.map((q: any) => ({
            questionText: q.questionText,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer,
            points: q.points.toString(),
          }))
        );
      }
      setLoading(false);
    });
  }, [courseId]);

  function updateQuestion(idx: number, patch: Partial<QuestionForm>) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }
  function updateOption(qIdx: number, oIdx: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    }));
  }
  function addQuestion() { setQuestions((prev) => [...prev, emptyQuestion()]); }
  function removeQuestion(idx: number) { setQuestions((prev) => prev.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setError('');
    const invalid = questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()));
    if (invalid) {
      setError('يرجى تعبئة نص كل سؤال وكل خياراته الأربعة.');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/courses/${courseId}/final-exam`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, passingScore, questions }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'حدث خطأ.'); return; }
    setHasExam(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleDelete() {
    setSaving(true);
    await fetch(`/api/admin/courses/${courseId}/final-exam`, { method: 'DELETE' });
    setHasExam(false);
    setTitle('الامتحان النهائي');
    setPassingScore('70');
    setQuestions([emptyQuestion()]);
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-brand-silver-dim py-12"><Loader2 className="animate-spin" size={18} /> جارِ التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-brand-royal/8 border border-brand-royal/20 rounded-xl p-4 text-xs text-brand-silver flex gap-2">
        <GraduationCap size={16} className="text-brand-royal-light shrink-0 mt-0.5" />
        <span>لو بنيت امتحان نهائي لهذه الدورة، الطالب ما رح ياخد شهادته إلا لما يكمل كل الدروس <strong>ويجتاز هذا الامتحان</strong>. لو ما بنيت امتحان، الشهادة بتصدر تلقائيًا بمجرد إكمال الدروس (زي السابق).</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">عنوان الامتحان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-premium w-full" />
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">نسبة النجاح المطلوبة (%)</label>
            <input type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className="input-premium w-full" />
          </div>
        </div>
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-royal-light font-bold">سؤال {qIdx + 1}</span>
            <button onClick={() => removeQuestion(qIdx)} className="text-red-400/70 hover:text-red-400"><Trash2 size={15} /></button>
          </div>
          <input
            value={q.questionText}
            onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
            placeholder="نص السؤال"
            className="input-premium w-full text-sm"
          />
          <div className="space-y-2">
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={q.correctAnswer === oIdx.toString()}
                  onChange={() => updateQuestion(qIdx, { correctAnswer: oIdx.toString() })}
                  className="accent-brand-royal"
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  placeholder={`خيار ${oIdx + 1}`}
                  className="input-premium flex-1 text-sm"
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-brand-silver-dim">اختر الدائرة بجانب الإجابة الصحيحة</p>
        </div>
      ))}

      <button onClick={addQuestion} className="w-full py-3 rounded-xl border border-dashed border-brand-royal/30 text-sm text-brand-royal-light hover:bg-brand-royal/5 flex items-center justify-center gap-2">
        <Plus size={15} /> إضافة سؤال
      </button>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saving} className="royal-gradient text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? (
            <><Loader2 className="animate-spin" size={18} /> جارِ الحفظ...</>
          ) : saved ? (
            <><CheckCircle2 size={18} /> تم الحفظ ✓</>
          ) : (
            <><Save size={18} /> حفظ الامتحان</>
          )}
        </button>
        {hasExam && (
          <button onClick={handleDelete} disabled={saving} className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium">
            حذف الامتحان (رجوع لإصدار تلقائي)
          </button>
        )}
      </div>
    </div>
  );
}
