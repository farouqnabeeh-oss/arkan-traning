'use client';

import React, { useEffect, useState } from 'react';
import { History, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  DELETE_COURSE: 'حذف دورة',
  SUSPEND_USER: 'تعليق حساب',
  REACTIVATE_USER: 'إعادة تفعيل حساب',
  EDIT_USER: 'تعديل بيانات طالب',
  DELETE_USER: 'حذف طالب',
  DELETE_BOOK: 'حذف كتاب',
  CREATE_BOOK: 'إنشاء كتاب',
  UPDATE_BOOK: 'تحديث كتاب',
  CREATE_USER: 'إنشاء حساب طالب',
  RESET_PASSWORD: 'إعادة تعيين كلمة المرور',
  MARK_MESSAGE_READ: 'تعيين رسالة كمقروءة',
  DELETE_MESSAGE: 'حذف رسالة',
  APPROVE_PURCHASE: 'موافقة على طلب شراء',
  REJECT_PURCHASE: 'رفض طلب شراء',
  APPROVE_COURSE_PURCHASE: 'موافقة على طلب شراء دورة',
  REJECT_COURSE_PURCHASE: 'رفض طلب شراء دورة',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setError('فشل تحميل السجلات.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteOne(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/audit?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteAll() {
    if (!confirm('هل أنت متأكد من حذف جميع سجلات التدقيق؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    setDeletingAll(true);
    try {
      const res = await fetch('/api/admin/audit?all=true', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
      }
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-white flex items-center gap-2">
            <History size={22} className="text-brand-royal-light" /> سجل التدقيق
          </h1>
          <p className="text-brand-silver-dim mt-1 text-sm">
            آخر 100 عملية حساسة نُفذت من لوحة التحكم
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={deleteAll}
            disabled={deletingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-bold disabled:opacity-50"
          >
            {deletingAll ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            حذف جميع السجلات
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-brand-silver-dim gap-2">
          <Loader2 className="animate-spin" size={20} /> جارِ التحميل...
        </div>
      ) : logs.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <p className="text-brand-silver-dim">لا توجد عمليات مسجلة بعد.</p>
        </div>
      ) : (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-brand-silver-dim text-xs">
                  <th className="text-right p-4 font-medium">العملية</th>
                  <th className="text-right p-4 font-medium">بواسطة</th>
                  <th className="text-right p-4 font-medium">التفاصيل</th>
                  <th className="text-right p-4 font-medium">التاريخ</th>
                  <th className="text-right p-4 font-medium">حذف</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 last:border-0">
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-royal/15 text-brand-royal-light font-bold">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="p-4 text-brand-white">{log.adminName}</td>
                    <td className="p-4 text-brand-silver-dim">{log.details || '—'}</td>
                    <td className="p-4 text-brand-silver-dim text-xs">
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteOne(log.id)}
                        disabled={deletingId === log.id}
                        className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === log.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
