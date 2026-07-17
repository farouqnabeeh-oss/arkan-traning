import { db } from './db';

export async function logAdminAction(
  admin: { id: string; name: string },
  action: string,
  targetType: string,
  targetId: string,
  details?: string
) {
  try {
    await db.adminAuditLog.create({
      data: { adminId: admin.id, adminName: admin.name, action, targetType, targetId, details },
    });
  } catch {
    // لا نكسر العملية الأساسية لو فشل تسجيل السجل
  }
}
