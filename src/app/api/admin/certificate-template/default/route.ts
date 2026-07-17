import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

const DEFAULT_ELEMENTS = [
  {
    id: "e1",
    type: "text",
    content: "منصة أركان التعليمية تشهد بأن",
    x: 10,
    y: 32,
    width: 80,
    fontSize: 18,
    color: "#C7D0DE",
    fontWeight: "normal",
    textAlign: "center",
  },
  {
    id: "e2",
    type: "variable",
    variable: "STUDENT_NAME",
    x: 10,
    y: 40,
    width: 80,
    fontSize: 42,
    color: "#F2F5FA",
    fontWeight: "bold",
    textAlign: "center",
  },
  {
    id: "e3",
    type: "text",
    content: "قد أتم بنجاح متطلبات دورة",
    x: 10,
    y: 52,
    width: 80,
    fontSize: 16,
    color: "#C7D0DE",
    fontWeight: "normal",
    textAlign: "center",
  },
  {
    id: "e4",
    type: "variable",
    variable: "COURSE_TITLE",
    x: 10,
    y: 58,
    width: 80,
    fontSize: 26,
    color: "#7C93F0",
    fontWeight: "bold",
    textAlign: "center",
  },
  {
    id: "e5",
    type: "divider",
    x: 30,
    y: 70,
    width: 40,
    fontSize: 0,
    color: "#3B5BDB",
    fontWeight: "normal",
    textAlign: "center",
  },
  {
    id: "e6",
    type: "variable",
    variable: "DATE",
    x: 10,
    y: 80,
    width: 35,
    fontSize: 12,
    color: "#77839A",
    fontWeight: "normal",
    textAlign: "right",
  },
  {
    id: "e7",
    type: "variable",
    variable: "VERIFICATION_ID",
    x: 55,
    y: 80,
    width: 35,
    fontSize: 12,
    color: "#77839A",
    fontWeight: "normal",
    textAlign: "left",
  },
];

export async function GET() {
  let template = await db.certificateTemplate.findFirst({
    where: { isDefault: true },
  });
  if (!template) {
    template = await db.certificateTemplate.create({
      data: {
        name: "القالب الافتراضي",
        isDefault: true,
        backgroundColor: "#0F1830",
        elements: DEFAULT_ELEMENTS,
      },
    });
  }
  return NextResponse.json({ template });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name, backgroundColor, elements, sealImage } = await request.json();
  if (!Array.isArray(elements))
    return NextResponse.json({ error: "بيانات غير صحيحة." }, { status: 400 });

  const sealData = typeof sealImage === 'string' ? sealImage : undefined;

  const existing = await db.certificateTemplate.findFirst({
    where: { isDefault: true },
  });
  const template = existing
    ? await db.certificateTemplate.update({
        where: { id: existing.id },
        data: {
          name: name || "القالب الافتراضي",
          backgroundColor,
          elements: elements,
          ...(sealData !== undefined && { sealImage: sealData }),
        },
      })
    : await db.certificateTemplate.create({
        data: {
          name: name || "القالب الافتراضي",
          isDefault: true,
          backgroundColor,
          elements: elements,
          ...(sealData !== undefined && { sealImage: sealData }),
        },
      });

  return NextResponse.json({ success: true, template });
}
