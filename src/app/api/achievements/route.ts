import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { ACHIEVEMENTS } from '@/lib/achievements';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const earned = await db.userAchievement.findMany({
    where: { userId: user.id },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });

  const earnedCodes = new Set(earned.map((e) => e.achievement.code));
  const all = ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: earnedCodes.has(a.code),
    earnedAt: earned.find((e) => e.achievement.code === a.code)?.earnedAt || null,
  }));

  return NextResponse.json({ achievements: all, earnedCount: earned.length, totalCount: ACHIEVEMENTS.length });
}
