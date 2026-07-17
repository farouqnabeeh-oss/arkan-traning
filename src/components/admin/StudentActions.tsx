'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ShieldAlert, ShieldCheck, Trash2, Plus, CheckCircle2 } from 'lucide-react';

interface Course { id: string; title: string; }

export default function StudentActions({
  studentId,
  initial,
  allCourses,
  enrolledCourseIds,
}: {
  studentId: string;
  initial: { name: string; email: string; phone: string; isSuspended: boolean };
  allCourses: Course[];
  enrolledCourseIds: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/users/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleSuspend() {
    setSaving(true);
    const next = !form.isSuspended;
    await fetch(`/api/admin/users/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: next }),
    });
    setForm((f) => ({ ...f, isSuspended: next }));
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setSaving(true);
    await fetch(`/api/admin/users/${studentId}`, { method: 'DELETE' });
    router.push('/dashboard/admin/students');
  }

  async function handleEnroll() {
    if (!selectedCourse) return;
    setEnrolling(true);
    await fetch(`/api/admin/users/${studentId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selectedCourse }),
    });
    setEnrolling(false);
    setSelectedCourse('');
    router.refresh();
  }

  async function handleUnenroll(courseId: string) {
    await fetch(`/api/admin/users/${studentId}/enroll`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    });
    router.refresh();
  }

  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* تعديل البيانات */}
      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="font-bold text-brand-white">تعديل البيانات</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">الاسم</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium w-full text-sm" />
          </div>
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">البريد الإلكتروني</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-premium w-full text-sm" dir="ltr" />
          </div>
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">رقم الهاتف</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-premium w-full text-sm" dir="ltr" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="royal-gradient text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={16} /> جارِ الحفظ...</>
            ) : saved ? (
              <><CheckCircle2 size={16} /> تم الحفظ</>
            ) : (
              <><Save size={16} /> حفظ التعديلات</>
            )}
          </button>
          <button
            onClick={toggleSuspend}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
              form.isSuspended ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            {form.isSuspended ? (
              <><ShieldCheck size={16} /> إعادة تفعيل الحساب</>
            ) : (
              <><ShieldAlert size={16} /> تعليق الحساب</>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
              confirmDelete ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <Trash2 size={16} /> {confirmDelete ? 'اضغط للتأكيد نهائيًا' : 'حذف الحساب نهائيًا'}
          </button>
        </div>
      </div>

      {/* تسجيل يدوي بدورة */}
      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
        <h3 className="font-bold text-brand-white mb-4">تسجيل الطالب بدورة يدويًا (منحة)</h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input-premium flex-1 min-w-[200px] text-sm"
          >
            <option value="">اختر دورة...</option>
            {availableCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button
            onClick={handleEnroll}
            disabled={!selectedCourse || enrolling}
            className="px-5 py-2.5 rounded-xl bg-brand-royal/15 text-brand-royal-light hover:bg-brand-royal/25 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {enrolling ? (
              <><Loader2 className="animate-spin" size={16} /> جارِ التسجيل...</>
            ) : (
              <><Plus size={16} /> تسجيل</>
            )}
          </button>
        </div>
        {enrolledCourseIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allCourses.filter((c) => enrolledCourseIds.includes(c.id)).map((c) => (
              <span key={c.id} className="flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-full text-brand-silver">
                {c.title}
                <button onClick={() => handleUnenroll(c.id)} className="text-red-400/70 hover:text-red-400">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
