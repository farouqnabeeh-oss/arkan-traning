import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword, comparePassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'يرجى إدخال كلمة المرور الحالية وكلمة مرور جديدة (8 أحرف على الأقل).' }, { status: 400 });
  }

  const fullUser = await db.user.findUnique({ where: { id: user.id } });
  if (!fullUser) return NextResponse.json({ error: 'المستخدم غير موجود.' }, { status: 404 });

  const isValid = await comparePassword(currentPassword, fullUser.passwordHash);
  if (!isValid) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة.' }, { status: 400 });

  const hashed = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hashed } });

  return NextResponse.json({ success: true });
}
