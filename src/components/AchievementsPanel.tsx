'use client';

import React, { useEffect, useState } from 'react';
import {
  Footprints, GraduationCap, Library, Award, Zap, Crown, Flame,
  Gamepad2, BookOpen, MessageCircle, Users, Lock, Loader2, Trophy,
} from 'lucide-react';

const ICONS: Record<string, any> = {
  footprints: Footprints, 'graduation-cap': GraduationCap, library: Library, award: Award,
  zap: Zap, crown: Crown, flame: Flame, 'gamepad-2': Gamepad2, 'book-open': BookOpen,
  'message-circle': MessageCircle, users: Users,
};

interface AchievementItem {
  code: string; title: string; description: string; icon: string;
  earned: boolean; earnedAt: string | null;
}

export default function AchievementsPanel() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/achievements').then((r) => r.json()).then((d) => {
      setAchievements(d.achievements || []);
      setEarnedCount(d.earnedCount || 0);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center gap-2 text-brand-white/40 font-tajawal text-sm py-6"><Loader2 className="animate-spin" size={16} /> جارِ التحميل...</div>;
  }

  return (
    <div className="glass-dark border border-white/5 rounded-3xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-tajawal font-black text-brand-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand-royal-light" /> الإنجازات
        </h2>
        <span className="text-sm text-brand-white/50 font-tajawal">{earnedCount}/{achievements.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] || Trophy;
          return (
            <div
              key={a.code}
              title={a.description}
              className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all ${
                a.earned ? 'bg-brand-royal/10 border-brand-royal/30' : 'bg-white/5 border-white/5 opacity-40 grayscale'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.earned ? 'bg-brand-royal/20' : 'bg-white/5'}`}>
                {a.earned ? <Icon size={20} className="text-brand-royal-light" /> : <Lock size={16} className="text-brand-white/30" />}
              </div>
              <p className="text-xs font-tajawal font-bold text-brand-white">{a.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
