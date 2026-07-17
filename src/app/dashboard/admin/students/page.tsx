import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, ShieldAlert } from 'lucide-react';

export default async function AdminStudentsPage() {
  const students = await db.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true, certificates: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-white">إدارة الطلاب</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">{students.length} طالب مسجل بالمنصة</p>
      </div>

      {students.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <Users size={40} className="mx-auto text-brand-silver-dim mb-4" />
          <p className="text-brand-silver-dim">لا يوجد طلاب مسجلين بعد.</p>
        </div>
      ) : (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-brand-silver-dim text-xs">
                  <th className="text-right p-4 font-medium">الاسم</th>
                  <th className="text-right p-4 font-medium">البريد الإلكتروني</th>
                  <th className="text-right p-4 font-medium">الدورات</th>
                  <th className="text-right p-4 font-medium">الشهادات</th>
                  <th className="text-right p-4 font-medium">الحالة</th>
                  <th className="text-right p-4 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <Link href={`/dashboard/admin/students/${s.id}`} className="text-brand-white font-medium hover:text-brand-royal-light">
                        {s.name}
                      </Link>
                    </td>
                    <td className="p-4 text-brand-silver-dim">{s.email}</td>
                    <td className="p-4 text-brand-silver">{s._count.enrollments}</td>
                    <td className="p-4 text-brand-silver">{s._count.certificates}</td>
                    <td className="p-4">
                      {s.isSuspended ? (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <ShieldAlert size={12} /> معلّق
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400">نشط</span>
                      )}
                    </td>
                    <td className="p-4 text-brand-silver-dim text-xs">
                      {new Date(s.createdAt).toLocaleDateString('ar-EG')}
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
