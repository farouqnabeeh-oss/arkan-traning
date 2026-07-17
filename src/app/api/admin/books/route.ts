import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/auditLog";

export const dynamic = 'force-dynamic';


async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { purchases: true } } },
  });
  return NextResponse.json({ books });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

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
  } = await request.json();

  if (!title || !slug || !description || price === undefined || !pdfFileKey) {
    return NextResponse.json(
      { error: "يرجى تعبئة العنوان والوصف والسعر ورابط ملف الـ PDF." },
      { status: 400 },
    );
  }

  const cleanSlug = String(slug)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-");
  const existing = await db.book.findUnique({ where: { slug: cleanSlug } });
  if (existing)
    return NextResponse.json(
      { error: "الرابط مستخدم لكتاب آخر." },
      { status: 400 },
    );

  const book = await db.book.create({
    data: {
      title,
      slug: cleanSlug,
      author: author || "فريق أركان",
      description,
      coverImage: coverImage || null,
      price: parseFloat(price),
      pdfFileKey,
      pagesCount: pagesCount ? parseInt(pagesCount, 10) : null,
      category: category || null,
      isPublished: !!isPublished,
      bundleCourseId: bundleCourseId || null,
      bundlePrice: bundlePrice ? parseFloat(bundlePrice) : null,
    },
  });

  await logAdminAction(admin, "CREATE_BOOK", "Book", book.id, book.title);

  return NextResponse.json({ success: true, book });
}
