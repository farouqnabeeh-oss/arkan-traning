import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountForm from '@/components/AccountForm';
import SessionsPanel from '@/components/SessionsPanel';
import ReferralCard from '@/components/ReferralCard';
import AchievementsPanel from '@/components/AchievementsPanel';
import { User2, Award, GraduationCap } from 'lucide-react';

export default async function AccountPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true,
      xp: true, streak: true, referralCode: true,
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl royal-gradient flex items-center justify-center text-2xl font-tajawal font-black text-white shadow-royal-glow shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-tajawal font-black text-brand-white">{user.name}</h1>
            <p className="text-brand-white/50 font-tajawal text-sm">عضو منذ {new Date(user.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-brand-royal-light" />
            <div>
              <p className="text-lg font-tajawal font-black text-brand-white">{user._count.enrollments}</p>
              <p className="text-xs text-brand-white/40 font-tajawal">دورة مسجّل بها</p>
            </div>
          </div>
          <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center gap-3">
            <Award className="w-6 h-6 text-brand-royal-light" />
            <div>
              <p className="text-lg font-tajawal font-black text-brand-white">{user._count.certificates}</p>
              <p className="text-xs text-brand-white/40 font-tajawal">شهادة حصلت عليها</p>
            </div>
          </div>
        </div>

        <ReferralCard referralCode={user.referralCode} xp={user.xp} streak={user.streak} />

        <AchievementsPanel />

        <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-tajawal font-black text-brand-white flex items-center gap-2">
            <User2 className="w-5 h-5 text-brand-royal-light" /> البيانات الشخصية
          </h2>
          <AccountForm initial={{ name: user.name, email: user.email, phone: user.phone || '' }} />
        </div>

        <div className="glass-dark border border-white/5 rounded-3xl p-8">
          <h2 className="text-xl font-tajawal font-black text-brand-white mb-6">الأجهزة والجلسات النشطة</h2>
          <SessionsPanel />
        </div>
      </div>
  );
}
