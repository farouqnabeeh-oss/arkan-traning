import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    // 1. Authenticate and check role
    const user = await getSessionUser();
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول. هذا الإجراء متاح للمدربين فقط." },
        { status: 403 },
      );
    }

    const { courseId, expiresAt, discountPercent } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "يرجى تحديد الدورة التدريبية لربط القسيمة بها." },
        { status: 400 },
      );
    }

    // 2. Fetch course to verify existence and get slug
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "الدورة التدريبية المحددة غير موجودة." },
        { status: 404 },
      );
    }

    // 3. Generate unique code
    // Form: ARKAN - [COURSE SHORT SLUG] - [RANDOM STRING]
    const shortSlug = course.slug.substring(0, 6).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const voucherCode = `ARKAN-${shortSlug}-${randomHex}`;
    const parsedDiscount = Number(discountPercent);
    const safeDiscount = Number.isFinite(parsedDiscount)
      ? Math.max(0, Math.min(100, parsedDiscount))
      : 100;

    // 4. Create voucher
    const voucher = await db.voucher.create({
      data: {
        code: voucherCode,
        courseId,
        discountPercent: safeDiscount,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        expiresAt: voucher.expiresAt,
        isUsed: voucher.isUsed,
        discountPercent: voucher.discountPercent,
      },
    });
  } catch (error) {
    console.error("Voucher creation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء توليد القسيمة." },
      { status: 500 },
    );
  }
}
