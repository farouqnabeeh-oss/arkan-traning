import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword, comparePassword } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  return NextResponse.json({ user: fullUser });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول.' }, { status: 401 });

  const { name, phone, currentPassword, newPassword } = await request.json();

  const data: Record<string, any> = {};
  if (name && name.trim().length >= 2) data.name = name.trim();
  if (phone !== undefined) data.phone = phone;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'يرجى إدخال كلمة المرور الحالية.' }, { status: 400 });
    }
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !(await comparePassword(currentPassword, dbUser.passwordHash))) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.' }, { status: 400 });
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
