import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import CourseBuilder from '@/components/admin/CourseBuilder';

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await db.course.findUnique({
    where: { id: params.id },
    include: { modules: { include: { lessons: true }, orderBy: { sortOrder: 'asc' } } },
  });

  if (!course) notFound();

  const initialData = {
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription || '',
    price: course.price,
    compareAtPrice: course.compareAtPrice,
    image: course.image || '',
    trailerUrl: course.trailerUrl || '',
    level: course.level,
    language: course.language,
    category: course.category || '',
    whatYoullLearn: course.whatYoullLearn,
    requirements: course.requirements,
    targetAudience: course.targetAudience,
    isPublished: course.isPublished,
    modules: course.modules
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((m) => ({
        title: m.title,
        lessons: m.lessons
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((l) => ({
            title: l.title,
            description: l.description || '',
            videoUrl: l.videoUrl || '',
            duration: l.duration?.toString() || '',
            isPublished: l.isPublished,
          })),
      })),
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/courses" className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع لقائمة الدورات
      </Link>
      <div>
        <h1 className="text-2xl font-black text-brand-white">تعديل: {course.title}</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">أي تعديل على المنهج بيعيد بناء الموديولات والدروس بالكامل عند الحفظ.</p>
      </div>
      <CourseBuilder courseId={course.id} initialData={initialData as any} />
    </div>
  );
}
