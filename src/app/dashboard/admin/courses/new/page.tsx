import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CourseBuilder from '@/components/admin/CourseBuilder';

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/courses" className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع لقائمة الدورات
      </Link>
      <div>
        <h1 className="text-2xl font-black text-brand-white">إنشاء دورة جديدة</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">عبّي كل التفاصيل بالتبويبات تحت، وتقدر تحفظ كمسودة وترجعلها بعدين.</p>
      </div>
      <CourseBuilder />
    </div>
  );
}
