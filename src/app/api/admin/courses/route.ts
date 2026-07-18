import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';


async function requireAdminOrInstructor() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR"))
    return null;
  return user;
}

export async function GET() {
  const user = await requireAdminOrInstructor();
  if (!user) {
    return NextResponse.json(
      { error: "غير مصرح لك بالوصول لهذه الصفحة." },
      { status: 401 },
    );
  }

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  const user = await requireAdminOrInstructor();
  if (!user) {
    return NextResponse.json(
      { error: "غير مصرح لك بالوصول لهذه الصفحة." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const {
    title,
    slug,
    description,
    shortDescription,
    price,
    compareAtPrice,
    image,
    trailerUrl,
    level,
    language,
    category,
    whatYoullLearn,
    requirements,
    targetAudience,
    isPublished,
    modules,
  } = body;

  if (!title || !description || price === undefined) {
    return NextResponse.json(
      { error: "يرجى إدخال جميع الحقول الأساسية المطلوبة." },
      { status: 400 },
    );
  }

  const generatedSlug = slug ? String(slug)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") : `course-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const cleanSlug = generatedSlug || `course-${Date.now()}`;

  const existing = await db.course.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    return NextResponse.json(
      { error: "عنوان الـ Slug مستخدم بالفعل لدورة أخرى." },
      { status: 400 },
    );
  }

  const course = await db.course.create({
    data: {
      title,
      slug: cleanSlug,
      description,
      shortDescription: shortDescription || null,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      image: image || null,
      trailerUrl: trailerUrl || null,
      level: level || "ALL_LEVELS",
      language: language || "العربية",
      category: category || null,
      whatYoullLearn: Array.isArray(whatYoullLearn) ? whatYoullLearn.filter(Boolean) : [],
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      targetAudience: Array.isArray(targetAudience) ? targetAudience.filter(Boolean) : [],
      isPublished: !!isPublished,
      modules: {
        create: Array.isArray(modules)
          ? modules.map((mod: any, mIdx: number) => ({
              title: mod.title,
              sortOrder: mIdx,
              lessons: {
                create: Array.isArray(mod.lessons)
                  ? mod.lessons.map((lesson: any, lIdx: number) => ({
                      title: lesson.title,
                      slug: `${cleanSlug}-l${mIdx}-${lIdx}-${lesson.title
                        .toString()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .slice(0, 30)}`,
                      description: lesson.description || null,
                      videoUrl: lesson.videoUrl || null,
                      duration: lesson.duration
                        ? parseInt(lesson.duration, 10)
                        : 0,
                      sortOrder: lIdx,
                      isPublished: !!lesson.isPublished,
                    }))
                  : [],
              },
            }))
          : [],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  return NextResponse.json({ success: true, course });
}
