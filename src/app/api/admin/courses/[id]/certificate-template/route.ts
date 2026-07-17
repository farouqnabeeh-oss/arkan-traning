import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

async function requireAdminOrInstructor() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR"))
    return null;
  return user;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  let template = await db.certificateTemplate.findUnique({
    where: { courseId: params.id },
  });
  if (!template) {
    template = await db.certificateTemplate.findFirst({
      where: { isDefault: true },
    });
  }

  return NextResponse.json({ template });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name, backgroundColor, elements, sealImage } = await request.json();
  if (!Array.isArray(elements)) {
    return NextResponse.json(
      { error: "بيانات القالب غير صحيحة." },
      { status: 400 },
    );
  }

  const sealData = typeof sealImage === 'string' ? sealImage : undefined;

  const template = await db.certificateTemplate.upsert({
    where: { courseId: params.id },
    update: {
      name: name || "قالب مخصص",
      backgroundColor,
      elements: elements,
      ...(sealData !== undefined && { sealImage: sealData }),
    },
    create: {
      courseId: params.id,
      name: name || "قالب مخصص",
      backgroundColor,
      elements: elements,
      isDefault: false,
      ...(sealData !== undefined && { sealImage: sealData }),
    },
  });

  return NextResponse.json({ success: true, template });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await db.certificateTemplate.deleteMany({ where: { courseId: params.id } });
  return NextResponse.json({ success: true });
}
