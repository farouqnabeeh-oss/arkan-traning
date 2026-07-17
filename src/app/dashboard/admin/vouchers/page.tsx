import React from 'react';
import { db } from '@/lib/db';
import VoucherGenerator from '@/components/VoucherGenerator';
import CoursePurchaseRequestsPanel from '@/components/admin/CoursePurchaseRequestsPanel';
import { Ticket, Clock } from 'lucide-react';

export default async function AdminVouchersPage() {
  const [courses, recentVouchers, pendingRequests] = await Promise.all([
    db.course.findMany({ orderBy: { title: 'asc' } }),
    db.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { course: { select: { title: true } } },
    }),
    db.coursePurchaseRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, price: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-white flex items-center gap-2">
          <Ticket size={22} className="text-brand-royal-light" /> الاشتراكات والقسائم
        </h1>
        <p className="text-brand-silver-dim mt-1 text-sm">راجع طلبات اشتراك الطلاب، أو أنشئ أكواد وصول مجاني/بخصم يدويًا</p>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h2 className="font-bold text-brand-white mb-3 flex items-center gap-2">
            <Clock size={18} className="text-amber-400" /> طلبات اشتراك بانتظار الموافقة ({pendingRequests.length})
          </h2>
          <CoursePurchaseRequestsPanel requests={JSON.parse(JSON.stringify(pendingRequests))} />
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr,380px] gap-6">
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-6">
          <h2 className="font-bold text-brand-white mb-4">آخر رموز الوصول المُصدرة</h2>
          {recentVouchers.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد قسائم بعد.</p>
          ) : (
            <div className="space-y-2">
              {recentVouchers.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                  <div>
                    <p className="font-mono text-brand-royal-light font-bold">{v.code}</p>
                    <p className="text-xs text-brand-silver-dim">{v.course.title} · خصم {v.discountPercent}%</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${v.isUsed ? 'bg-white/10 text-brand-silver-dim' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {v.isUsed ? 'مُستخدمة' : 'متاحة'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <VoucherGenerator courses={courses} />
      </div>
    </div>
  );
}
