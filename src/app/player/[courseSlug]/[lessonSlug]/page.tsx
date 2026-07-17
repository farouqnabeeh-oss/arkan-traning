import React from 'react';
import Navbar from '@/components/Navbar';
import LessonPlayerClient from '@/components/LessonPlayerClient';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';

interface Props {
  params: {
    courseSlug: string;
    lessonSlug: string;
  };
}

export default async function PlayerLessonPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirect=/player/${params.courseSlug}/${params.lessonSlug}`);
  }

  // 1. Fetch course details
  const course = await db.course.findUnique({
    where: { slug: params.courseSlug },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // 2. Fetch enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    include: {
      lessonProgresses: true,
    },
  });

  if (!enrollment) {
    redirect(`/courses/${params.courseSlug}`);
  }

  // 3. Find the specific lesson
  let currentLesson = null;
  for (const mod of course.modules) {
    const found = mod.lessons.find((l) => l.slug === params.lessonSlug);
    if (found) {
      currentLesson = found;
      break;
    }
  }

  if (!currentLesson) {
    notFound();
  }

  // 4. Fetch the full lesson object including Quizzes and Questions
  const fullLesson = await db.lesson.findUnique({
    where: { id: currentLesson.id },
    include: {
      quizzes: {
        include: {
          questions: true,
        },
      },
      notes: {
        where: { userId: user.id },
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!fullLesson) {
    notFound();
  }

  // Prepare notes list
  const initialNotes = fullLesson.notes.map((n) => ({
    id: n.id,
    content: n.content,
    timestamp: n.timestamp,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <LessonPlayerClient
        course={course}
        modules={course.modules}
        currentLesson={fullLesson}
        enrollmentId={enrollment.id}
        initialNotes={initialNotes}
        initialProgresses={enrollment.lessonProgresses}
        userEmail={user.email}
      />
    </div>
  );
}
