import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// DELETE /api/admin/audit?id=xxx  → delete one
// DELETE /api/admin/audit?all=true → delete all
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const all = searchParams.get('all');

  if (all === 'true') {
    await db.adminAuditLog.deleteMany({});
    return NextResponse.json({ success: true, deleted: 'all' });
  }

  if (id) {
    await db.adminAuditLog.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: id });
  }

  return NextResponse.json({ error: 'يرجى تحديد id أو all=true' }, { status: 400 });
}
