import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/auditLog";

export const dynamic = 'force-dynamic';


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

  const course = await db.course.findUnique({
    where: { id: params.id },
    include: {
      modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!course)
    return NextResponse.json({ error: "الدورة غير موجودة." }, { status: 404 });

  return NextResponse.json({ course });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

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

  const cleanSlug = slug
    ? String(slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
    : undefined;

  if (cleanSlug) {
    const existing = await db.course.findFirst({
      where: { slug: cleanSlug, NOT: { id: params.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "عنوان الـ Slug مستخدم بالفعل لدورة أخرى." },
        { status: 400 },
      );
    }
  }

  // إعادة بناء المنهج بالكامل (أبسط وأضمن طريقة لمزامنة الموديولات والدروس)
  if (Array.isArray(modules)) {
    await db.module.deleteMany({ where: { courseId: params.id } });
  }

  const course = await db.course.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(cleanSlug && { slug: cleanSlug }),
      ...(description && { description }),
      shortDescription: shortDescription ?? undefined,
      ...(price !== undefined && { price: parseFloat(price) }),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      image: image ?? undefined,
      trailerUrl: trailerUrl ?? undefined,
      ...(level && { level }),
      ...(language && { language }),
      category: category ?? undefined,
      ...(whatYoullLearn && {
        whatYoullLearn: Array.isArray(whatYoullLearn) ? whatYoullLearn.filter(Boolean) : [],
      }),
      ...(requirements && {
        requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      }),
      ...(targetAudience && {
        targetAudience: Array.isArray(targetAudience) ? targetAudience.filter(Boolean) : [],
      }),
      ...(isPublished !== undefined && { isPublished: !!isPublished }),
      ...(Array.isArray(modules) && {
        modules: {
          create: modules.map((mod: any, mIdx: number) => ({
            title: mod.title,
            sortOrder: mIdx,
            lessons: {
              create: Array.isArray(mod.lessons)
                ? mod.lessons.map((lesson: any, lIdx: number) => ({
                    title: lesson.title,
                    slug: `l${mIdx}-${lIdx}-${lesson.title
                      .toString()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .slice(0, 30)}-${Date.now().toString(36).slice(-4)}`,
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
          })),
        },
      }),
    },
    include: { modules: { include: { lessons: true } } },
  });

  return NextResponse.json({ success: true, course });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const course = await db.course.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  await db.course.delete({ where: { id: params.id } });
  await logAdminAction(
    user,
    "DELETE_COURSE",
    "Course",
    params.id,
    course?.title,
  );

  return NextResponse.json({ success: true });
}
