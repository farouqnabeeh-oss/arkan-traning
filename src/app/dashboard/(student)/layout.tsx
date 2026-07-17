import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import StudentDashboardSidebar from '@/components/StudentDashboardSidebar';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col lg:flex-row" dir="rtl">
      {/* Sidebar navigation */}
      <StudentDashboardSidebar user={{ name: user.name, email: user.email }} />

      {/* Main dashboard content area */}
      <div className="flex-1 min-w-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
