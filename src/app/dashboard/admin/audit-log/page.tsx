import React from "react";
import { db } from "@/lib/db";
import { History } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  DELETE_COURSE: "حذف دورة",
  SUSPEND_USER: "تعليق حساب",
  REACTIVATE_USER: "إعادة تفعيل حساب",
  EDIT_USER: "تعديل بيانات طالب",
  DELETE_USER: "حذف طالب",
  DELETE_BOOK: "حذف كتاب",
  CREATE_BOOK: "إنشاء كتاب",
  UPDATE_BOOK: "تحديث كتاب",
  CREATE_USER: "إنشاء حساب طالب",
  RESET_PASSWORD: "إعادة تعيين كلمة المرور",
  MARK_MESSAGE_READ: "تعيين رسالة كمقروءة",
  DELETE_MESSAGE: "حذف رسالة",
  APPROVE_PURCHASE: "موافقة على طلب شراء",
  REJECT_PURCHASE: "رفض طلب شراء",
};

export default async function AuditLogPage() {
  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-white flex items-center gap-2">
          <History size={22} className="text-brand-royal-light" /> سجل التدقيق
        </h1>
        <p className="text-brand-silver-dim mt-1 text-sm">
          آخر 100 عملية حساسة نُفذت من لوحة التحكم
        </p>
      </div>

      {logs.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-royal/15 text-brand-royal-light font-bold">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="p-4 text-brand-white">{log.adminName}</td>
                    <td className="p-4 text-brand-silver-dim">
                      {log.details || "—"}
                    </td>
                    <td className="p-4 text-brand-silver-dim text-xs">
                      {new Date(log.createdAt).toLocaleString("ar-EG")}
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
