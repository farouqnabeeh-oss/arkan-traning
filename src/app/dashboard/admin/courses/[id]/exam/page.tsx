import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import FinalExamBuilder from '@/components/admin/FinalExamBuilder';

export default async function CourseFinalExamPage({ params }: { params: { id: string } }) {
  const course = await db.course.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/admin/courses/${params.id}`} className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع لتعديل الدورة
      </Link>
      <div>
        <h1 className="text-2xl font-black text-brand-white">الامتحان النهائي: {course.title}</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">اختبار شامل يحدد إصدار شهادة هذه الدورة</p>
      </div>
      <FinalExamBuilder courseId={params.id} />
    </div>
  );
}
