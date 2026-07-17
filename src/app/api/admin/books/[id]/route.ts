import { NextResponse } from "next/server";
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

  const book = await db.book.findUnique({ where: { id: params.id } });
  if (!book)
    return NextResponse.json({ error: "الكتاب غير موجود." }, { status: 404 });
  return NextResponse.json({ book });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const {
    title,
    slug,
    author,
    description,
    coverImage,
    price,
    pdfFileKey,
    pagesCount,
    category,
    isPublished,
    bundleCourseId,
    bundlePrice,
  } = body;

  const cleanSlug = slug
    ? String(slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
    : undefined;
  if (cleanSlug) {
    const existing = await db.book.findFirst({
      where: { slug: cleanSlug, NOT: { id: params.id } },
    });
    if (existing)
      return NextResponse.json(
        { error: "الرابط مستخدم لكتاب آخر." },
        { status: 400 },
      );
  }

  const book = await db.book.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(cleanSlug && { slug: cleanSlug }),
      ...(author && { author }),
      ...(description && { description }),
      coverImage: coverImage ?? undefined,
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(pdfFileKey && { pdfFileKey }),
      pagesCount: pagesCount ? parseInt(pagesCount, 10) : undefined,
      category: category ?? undefined,
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
      bundleCourseId:
        bundleCourseId !== undefined ? bundleCourseId || null : undefined,
      bundlePrice:
        bundlePrice !== undefined
          ? bundlePrice
            ? parseFloat(bundlePrice)
            : null
          : undefined,
    },
  });

  await logAdminAction(admin, "UPDATE_BOOK", "Book", book.id, book.title);

  return NextResponse.json({ success: true, book });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const book = await db.book.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  await db.book.delete({ where: { id: params.id } });
  await logAdminAction(admin, "DELETE_BOOK", "Book", params.id, book?.title);

  return NextResponse.json({ success: true });
}
