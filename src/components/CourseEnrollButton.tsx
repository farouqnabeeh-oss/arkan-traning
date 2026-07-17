'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EnrollmentModal from './EnrollmentModal';
import { CreditCard } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  price: number;
}

export default function CourseEnrollButton({
  course,
  isLoggedIn,
  isEnrolled,
}: {
  course: Course;
  isLoggedIn: boolean;
  isEnrolled: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }
    setModalOpen(true);
  };

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push(`/dashboard`)}
        className="w-full py-4 bg-brand-navy hover:bg-brand-navy/90 text-brand-royal border border-brand-royal/30 rounded-xl font-tajawal font-bold text-lg shadow-md transition-all duration-200"
      >
        اذهب للوحة التحكم والمتابعة
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleEnrollClick}
        className="w-full py-4 royal-gradient hover:royal-gradient-hover text-brand-dark rounded-xl font-tajawal font-bold text-lg shadow-lg shadow-brand-royal/10 hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <CreditCard className="w-5 h-5" />
        اشترك في هذه الدورة الآن
      </button>

      <EnrollmentModal
        course={course}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
