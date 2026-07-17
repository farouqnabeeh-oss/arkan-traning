import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/auditLog";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const student = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isSuspended: true,
      createdAt: true,
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, slug: true, price: true },
          },
          lessonProgresses: true,
          voucher: { select: { code: true, discountPercent: true } },
        },
      },
      quizAttempts: {
        include: { quiz: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      submissions: {
        include: { assignment: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      certificates: {
        include: { course: { select: { title: true } } },
      },
      loginEvents: {
        orderBy: { createdAt: "desc" },
        take: 15,
      },
      sessions: {
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      },
      bookPurchases: {
        include: { book: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      },
      gameScores: {
        include: { game: { select: { name: true } } },
        orderBy: { completedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!student)
    return NextResponse.json({ error: "الطالب غير موجود." }, { status: 404 });

  return NextResponse.json({ student });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name, email, phone, role, isSuspended, password } =
    await request.json();
  const passwordHash =
    password !== undefined && String(password).trim()
      ? await bcrypt.hash(String(password).trim(), 10)
      : undefined;

  const student = await db.user.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(role && { role }),
      ...(isSuspended !== undefined && { isSuspended: !!isSuspended }),
      ...(passwordHash && { passwordHash }),
    },
  });

  // لو تم تعليق الحساب، نلغي كل جلساته النشطة فورًا
  if (isSuspended === true) {
    await db.deviceSession.updateMany({
      where: { userId: params.id, isActive: true },
      data: { isActive: false },
    });
    await logAdminAction(
      admin,
      "SUSPEND_USER",
      "User",
      params.id,
      student.name,
    );
  } else if (isSuspended === false) {
    await logAdminAction(
      admin,
      "REACTIVATE_USER",
      "User",
      params.id,
      student.name,
    );
  } else if (passwordHash) {
    await logAdminAction(
      admin,
      "RESET_PASSWORD",
      "User",
      params.id,
      student.name,
    );
  } else {
    await logAdminAction(admin, "EDIT_USER", "User", params.id, student.name);
  }

  return NextResponse.json({ success: true, student });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const student = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, email: true },
  });
  await db.user.delete({ where: { id: params.id } });
  await logAdminAction(
    admin,
    "DELETE_USER",
    "User",
    params.id,
    `${student?.name} (${student?.email})`,
  );

  return NextResponse.json({ success: true });
}
