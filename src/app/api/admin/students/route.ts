import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) return null;
  return user;
}

// GET all students
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const students = await db.user.findMany({
    where: { role: { in: ['STUDENT', 'INSTRUCTOR'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      _count: { select: { enrollments: true, certificates: true } },
    },
  });

  return NextResponse.json({ students });
}

// POST create student
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { name, email, phone, password, role, isSuspended } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'الاسم والبريد وكلمة المرور مطلوبة.' }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(String(password).trim(), 10);
  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      passwordHash,
      role: role || 'STUDENT',
      isSuspended: !!isSuspended,
      emailVerified: true,
      onboardingCompleted: true,
    },
  });

  await logAdminAction(admin, 'CREATE_USER', 'User', user.id, user.name);
  return NextResponse.json({ success: true, user });
}
