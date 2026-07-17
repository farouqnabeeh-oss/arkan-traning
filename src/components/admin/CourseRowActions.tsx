'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, EyeOff, Trash2, Loader2, GraduationCap, Award } from 'lucide-react';

export default function CourseRowActions({ courseId, isPublished }: { courseId: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function togglePublish() {
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setLoading(true);
    await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
      <Link
        href={`/dashboard/admin/courses/${courseId}`}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-brand-silver transition-colors"
      >
        <Pencil size={14} /> تعديل
      </Link>
      <Link
        href={`/dashboard/admin/courses/${courseId}/exam`}
        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-brand-silver transition-colors"
        title="الامتحان النهائي"
      >
        <GraduationCap size={14} />
      </Link>
      <Link
        href={`/dashboard/admin/courses/${courseId}/certificate`}
        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-brand-silver transition-colors"
        title="قالب الشهادة"
      >
        <Award size={14} />
      </Link>
      <button
        onClick={togglePublish}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-brand-silver transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
        {isPublished ? 'إخفاء' : 'نشر'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50 ${
          confirmDelete ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
        }`}
      >
        <Trash2 size={14} /> {confirmDelete ? 'تأكيد؟' : ''}
      </button>
    </div>
  );
}
