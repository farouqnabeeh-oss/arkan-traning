import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/auditLog";

export const dynamic = 'force-dynamic';


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getSessionUser();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "INSTRUCTOR"))
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { isRead } = await request.json();
  const message = await db.contactMessage.update({
    where: { id: params.id },
    data: { isRead: !!isRead },
  });
  await logAdminAction(
    admin,
    "MARK_MESSAGE_READ",
    "ContactMessage",
    params.id,
    message.subject,
  );
  return NextResponse.json({ success: true, message });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getSessionUser();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "INSTRUCTOR"))
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const message = await db.contactMessage.findUnique({
    where: { id: params.id },
    select: { subject: true },
  });
  await db.contactMessage.delete({ where: { id: params.id } });
  await logAdminAction(
    admin,
    "DELETE_MESSAGE",
    "ContactMessage",
    params.id,
    message?.subject || "رسالة",
  );
  return NextResponse.json({ success: true });
}
