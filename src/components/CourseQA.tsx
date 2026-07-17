'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, Loader2, AlertCircle, ShieldCheck, CornerDownLeft } from 'lucide-react';

interface Answer { id: string; content: string; user: { name: string; role?: string }; createdAt: string; }
interface Question { id: string; title: string; content: string; user: { name: string }; createdAt: string; answers: Answer[]; }

export default function CourseQA({
  courseId, initialQuestions, isLoggedIn,
}: { courseId: string; initialQuestions: Question[]; isLoggedIn: boolean; }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isLoggedIn) { router.push('/login'); return; }
    if (title.trim().length < 4 || content.trim().length < 5) {
      setError('يرجى كتابة عنوان ومحتوى واضحين للسؤال.');
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/courses/${courseId}/questions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || 'حدث خطأ.'); return; }
    setQuestions((prev) => [data.question, ...prev]);
    setTitle(''); setContent(''); setShowForm(false);
  }

  async function handleReply(questionId: string) {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (replyContent.trim().length < 3) return;
    setReplySubmitting(true);
    const res = await fetch(`/api/courses/${courseId}/questions/${questionId}/answers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: replyContent }),
    });
    const data = await res.json();
    setReplySubmitting(false);
    if (!res.ok) return;
    setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, answers: [...q.answers, data.answer] } : q));
    setReplyContent(''); setReplyingTo(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-tajawal font-bold text-brand-white flex items-center gap-3">
          <span className="w-1.5 h-8 royal-gradient rounded-full block" /> أسئلة الطلاب ({questions.length})
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm font-tajawal font-bold text-brand-royal-light hover:text-brand-royal flex items-center gap-1.5"
        >
          <MessageCircle size={16} /> اطرح سؤالًا
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-dark border border-white/5 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-2.5 rounded-xl font-tajawal">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان السؤال" className="input-premium w-full font-tajawal text-sm" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="اشرح سؤالك بالتفصيل..." rows={3} className="input-premium w-full font-tajawal text-sm resize-none" />
          <button type="submit" disabled={submitting} className="royal-gradient text-white font-tajawal font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50 text-sm">
            {submitting ? (
              <><Loader2 className="animate-spin" size={16} /> جارِ الإرسال...</>
            ) : (
              <><Send size={16} /> إرسال السؤال</>
            )}
          </button>
        </form>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-brand-white/40 font-tajawal">لا توجد أسئلة بعد، كن أول من يسأل ويبدأ النقاش.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="glass-dark border border-white/5 rounded-2xl p-6">
              <p className="font-tajawal font-bold text-brand-white mb-1">{q.title}</p>
              <p className="text-sm text-brand-white/60 font-tajawal mb-3">{q.content}</p>
              <p className="text-xs text-brand-white/30 font-tajawal mb-4">{q.user.name} — {new Date(q.createdAt).toLocaleDateString('ar-EG')}</p>

              {q.answers.length > 0 && (
                <div className="border-r-2 border-brand-royal/30 pr-4 space-y-3 mb-4">
                  {q.answers.map((a) => (
                    <div key={a.id}>
                      <p className="text-sm text-brand-white/70 font-tajawal">{a.content}</p>
                      <p className="text-xs font-tajawal mt-1 flex items-center gap-1.5">
                        {(a.user.role === 'INSTRUCTOR' || a.user.role === 'ADMIN') ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold"><ShieldCheck size={12} /> {a.user.name} · إجابة المدرب</span>
                        ) : (
                          <span className="text-brand-royal-light">{a.user.name}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === q.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="اكتب إجابتك..."
                    className="input-premium flex-1 text-xs font-tajawal"
                    autoFocus
                  />
                  <button onClick={() => handleReply(q.id)} disabled={replySubmitting} className="text-brand-royal-light hover:text-brand-royal disabled:opacity-50">
                    {replySubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              ) : (
                <button onClick={() => { setReplyingTo(q.id); setReplyContent(''); }} className="text-xs text-brand-white/40 hover:text-brand-royal-light font-tajawal flex items-center gap-1.5">
                  <CornerDownLeft size={13} /> أضف إجابة
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
