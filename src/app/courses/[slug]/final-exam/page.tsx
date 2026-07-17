import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import FinalExamPlayer from '@/components/FinalExamPlayer';

export default async function FinalExamPage({ params }: { params: { slug: string } }) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?redirect=/courses/${params.slug}/final-exam`);

  const course = await db.course.findUnique({ where: { slug: params.slug } });
  if (!course) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (!enrollment) redirect(`/courses/${params.slug}`);

  const exam = await db.quiz.findFirst({
    where: { courseId: course.id, isFinalExam: true },
    include: { questions: true },
  });
  if (!exam) redirect(`/courses/${params.slug}`);

  const previousAttempts = await db.quizAttempt.findMany({
    where: { quizId: exam.id, userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  const alreadyPassed = previousAttempts.some((a) => a.isPassed);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-4 pt-36 pb-24 w-full">
        <FinalExamPlayer
          courseSlug={params.slug}
          courseTitle={course.title}
          exam={JSON.parse(JSON.stringify(exam))}
          isCourseCompleted={enrollment.isCompleted}
          alreadyPassed={alreadyPassed}
          previousAttemptsCount={previousAttempts.length}
        />
      </main>
      <Footer />
    </div>
  );
}
