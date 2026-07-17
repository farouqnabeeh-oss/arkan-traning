import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

interface Props {
  params: {
    courseSlug: string;
  };
}

export default async function PlayerPageRedirect({ params }: Props) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?redirect=/player/${params.courseSlug}`);
  }

  // Fetch course
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

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment) {
    redirect(`/courses/${params.courseSlug}`);
  }

  // Redirect to first lesson
  const firstLesson = course.modules[0]?.lessons[0];
  if (!firstLesson) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center font-tajawal text-center p-4">
        <div className="glass-dark border border-brand-royal/20 p-8 rounded-2xl max-w-sm">
          <h1 className="text-xl font-bold text-brand-white mb-2">الدورة فارغة</h1>
          <p className="text-sm text-brand-white/50">لم يقم المدرب بإضافة أي دروس لهذه الدورة التدريبية بعد.</p>
        </div>
      </div>
    );
  }

  redirect(`/player/${params.courseSlug}/${firstLesson.slug}`);
}
