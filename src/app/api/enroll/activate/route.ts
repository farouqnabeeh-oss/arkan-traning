import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول أولاً.' },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const { courseId, code } = await request.json();

    if (!courseId || !code) {
      return NextResponse.json(
        { error: 'يرجى تقديم معرّف الدورة التدريبية ورمز القسيمة.' },
        { status: 400 }
      );
    }

    // 3. Find valid voucher
    const voucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() },
      include: { course: true },
    });

    if (!voucher) {
      return NextResponse.json(
        { error: 'رمز القسيمة غير صحيح.' },
        { status: 400 }
      );
    }

    if (voucher.courseId !== courseId) {
      return NextResponse.json(
        { error: 'هذه القسيمة غير صالحة لهذه الدورة التدريبية.' },
        { status: 400 }
      );
    }

    if (voucher.isUsed) {
      return NextResponse.json(
        { error: 'تم استخدام هذه القسيمة مسبقاً.' },
        { status: 400 }
      );
    }

    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'انتهت صلاحية هذه القسيمة.' },
        { status: 400 }
      );
    }

    // 4. Enroll user and flag voucher
    // Start database transaction
    await db.$transaction(async (tx) => {
      // Create Enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
          voucherId: voucher.id,
        },
      });

      // Fetch all lessons for modules in this course
      const lessons = await tx.lesson.findMany({
        where: {
          module: {
            courseId: courseId,
          },
        },
      });

      // Create lesson progress templates for every lesson
      if (lessons.length > 0) {
        await tx.lessonProgress.createMany({
          data: lessons.map((lesson) => ({
            enrollmentId: enrollment.id,
            lessonId: lesson.id,
            isCompleted: false,
            watchTime: 0,
          })),
        });
      }

      // Mark voucher as used
      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Voucher activation error:', error);
    
    // Check for duplicate enrollment constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'أنت مشترك بالفعل في هذه الدورة التدريبية.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء تفعيل القسيمة. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
