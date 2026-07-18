'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, ShieldAlert, Shield, Trash2, Pencil, Loader2,
  X, Eye, Search, UserCheck, AlertCircle, BookOpen, Award,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  _count: { enrollments: number; certificates: number };
}

interface Modal { type: 'add' | 'edit' | 'delete' | null; student?: Student }

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'STUDENT', isSuspended: false };

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Modal>({ type: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      setStudents(data.students || []);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ type: 'add' });
  }

  function openEdit(s: Student) {
    setForm({ name: s.name, email: s.email, phone: s.phone || '', password: '', role: s.role, isSuspended: s.isSuspended });
    setError('');
    setModal({ type: 'edit', student: s });
  }

  function openDelete(s: Student) {
    setModal({ type: 'delete', student: s });
  }

  async function handleSave() {
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('الاسم والبريد الإلكتروني مطلوبان.'); return;
    }
    if (modal.type === 'add' && !form.password.trim()) {
      setError('كلمة المرور مطلوبة عند الإضافة.'); return;
    }
    setSaving(true);
    try {
      let res: Response;
      if (modal.type === 'add') {
        res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`/api/admin/users/${modal.student!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ.'); return; }
      await fetchStudents();
      setModal({ type: null });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!modal.student) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/users/${modal.student.id}`, { method: 'DELETE' });
      setStudents(prev => prev.filter(s => s.id !== modal.student!.id));
      setModal({ type: null });
    } finally {
      setSaving(false);
    }
  }

  async function toggleSuspend(s: Student) {
    await fetch(`/api/admin/users/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuspended: !s.isSuspended }),
    });
    setStudents(prev => prev.map(st => st.id === s.id ? { ...st, isSuspended: !s.isSuspended } : st));
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-white">إدارة الطلاب</h1>
          <p className="text-brand-silver-dim mt-1 text-sm">{students.length} طالب مسجّل بالمنصة</p>
        </div>
        <button
          onClick={openAdd}
          className="royal-gradient text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> إضافة طالب
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver-dim" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          className="input-premium w-full pr-10"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الطلاب', value: students.length, icon: Users, color: 'text-brand-royal-light' },
          { label: 'حسابات نشطة', value: students.filter(s => !s.isSuspended).length, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'حسابات معلقة', value: students.filter(s => s.isSuspended).length, icon: ShieldAlert, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4 flex items-center gap-3">
            <Icon size={20} className={color} />
            <div>
              <p className="text-xl font-black text-brand-white">{value}</p>
              <p className="text-xs text-brand-silver-dim">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-brand-silver-dim gap-2">
          <Loader2 className="animate-spin" size={20} /> جارِ التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <Users size={40} className="mx-auto text-brand-silver-dim mb-4" />
          <p className="text-brand-silver-dim">لا يوجد نتائج.</p>
        </div>
      ) : (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-brand-silver-dim text-xs">
                  <th className="text-right p-4 font-medium">الطالب</th>
                  <th className="text-right p-4 font-medium">الجوال</th>
                  <th className="text-right p-4 font-medium hidden md:table-cell">الدورات</th>
                  <th className="text-right p-4 font-medium hidden md:table-cell">الشهادات</th>
                  <th className="text-right p-4 font-medium">الحالة</th>
                  <th className="text-right p-4 font-medium">تاريخ التسجيل</th>
                  <th className="text-right p-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-brand-white font-medium">{s.name}</p>
                        <p className="text-xs text-brand-silver-dim">{s.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-brand-silver-dim text-xs" dir="ltr">{s.phone || '—'}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-brand-silver text-xs">
                        <BookOpen size={12} className="text-brand-royal-light" />{s._count.enrollments}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-brand-silver text-xs">
                        <Award size={12} className="text-amber-400" />{s._count.certificates}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.isSuspended ? (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full w-fit">
                          <ShieldAlert size={11} /> معلّق
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">نشط</span>
                      )}
                    </td>
                    <td className="p-4 text-brand-silver-dim text-xs">
                      {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/admin/students/${s.id}`}
                          className="p-1.5 rounded-lg text-brand-silver-dim hover:text-brand-white hover:bg-white/10 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-brand-silver-dim hover:text-brand-royal-light hover:bg-brand-royal/10 transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleSuspend(s)}
                          className={`p-1.5 rounded-lg transition-colors ${s.isSuspended ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-amber-400 hover:bg-amber-500/10'}`}
                          title={s.isSuspended ? 'إعادة تفعيل' : 'تعليق'}
                        >
                          {s.isSuspended ? <Shield size={14} /> : <ShieldAlert size={14} />}
                        </button>
                        <button
                          onClick={() => openDelete(s)}
                          className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal.type === 'add' || modal.type === 'edit') && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-navy border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-5 relative shadow-2xl">
            <button onClick={() => setModal({ type: null })} className="absolute top-4 left-4 text-brand-silver-dim hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black text-brand-white">
              {modal.type === 'add' ? 'إضافة طالب جديد' : 'تعديل بيانات الطالب'}
            </h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="relative">
                <label className="text-xs text-brand-silver-dim block mb-1.5 font-tajawal">الاسم الكامل *</label>
                <div className="relative">
                  <UserCheck size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver-dim" />
                  <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="input-premium w-full pr-11" placeholder="أدخل اسم الطالب رباعي" />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs text-brand-silver-dim block mb-1.5 font-tajawal">البريد الإلكتروني *</label>
                <div className="relative">
                  <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver-dim" />
                  <input type="email" dir="ltr" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="input-premium w-full pl-4 pr-11 text-left" placeholder="student@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs text-brand-silver-dim block mb-1.5 font-tajawal">رقم الجوال</label>
                  <div className="relative">
                    <input type="tel" dir="ltr" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="input-premium w-full text-left" placeholder="+970 59..." />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-xs text-brand-silver-dim block mb-1.5 font-tajawal">الدور</label>
                  <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))} className="input-premium w-full">
                    <option value="STUDENT">طالب</option>
                    <option value="INSTRUCTOR">مدرب</option>
                    <option value="ADMIN">مدير</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <label className="text-xs text-brand-silver-dim block mb-1.5 font-tajawal">
                  {modal.type === 'add' ? 'كلمة المرور *' : 'كلمة مرور جديدة (اتركها فارغة للتجاهل)'}
                </label>
                <div className="relative">
                  <Shield size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-silver-dim" />
                  <input type="password" dir="ltr" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} className="input-premium w-full pl-4 pr-11 text-left" placeholder="*********" />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-500/5 transition-all">
                  <input
                    type="checkbox"
                    checked={form.isSuspended}
                    onChange={e => setForm(prev => ({ ...prev, isSuspended: e.target.checked }))}
                    className="w-5 h-5 accent-red-500 rounded border-white/10 bg-brand-navy"
                  />
                  <div>
                    <span className="text-brand-white text-sm font-bold block">تعليق حساب الطالب</span>
                    <span className="text-[11px] text-brand-silver-dim">سيتم منعه من تسجيل الدخول والوصول للدورات</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 royal-gradient text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : null}
                {modal.type === 'add' ? 'إضافة' : 'حفظ التغييرات'}
              </button>
              <button
                onClick={() => setModal({ type: null })}
                className="px-5 py-3 rounded-xl bg-white/10 text-brand-silver hover:bg-white/15 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {modal.type === 'delete' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-navy border border-white/10 rounded-3xl p-8 w-full max-w-sm space-y-5 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-white mb-1">حذف الطالب</h2>
              <p className="text-brand-silver-dim text-sm">
                هل أنت متأكد من حذف <span className="text-brand-white font-bold">{modal.student?.name}</span>؟
                سيتم حذف جميع بياناته وتسجيلاته بشكل نهائي.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : null} تأكيد الحذف
              </button>
              <button
                onClick={() => setModal({ type: null })}
                className="px-5 py-3 rounded-xl bg-white/10 text-brand-silver hover:bg-white/15 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
