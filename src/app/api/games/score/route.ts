import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { checkGameAchievements, checkProgressAchievements } from '@/lib/achievements';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    const { gameSlug, score, level = 1, hintsUsed = 0, timeTakenSecs } = await request.json();

    if (!gameSlug || score === undefined) {
      return NextResponse.json(
        { error: 'يرجى تقديم الكود المعرف للعبة والنتيجة.' },
        { status: 400 }
      );
    }

    // 1. Find the game
    const game = await db.game.findUnique({
      where: { slug: gameSlug },
    });

    if (!game) {
      return NextResponse.json({ error: 'اللعبة المحددة غير موجودة.' }, { status: 404 });
    }

    // 2. Save score
    const gameScore = await db.gameScore.create({
      data: {
        gameId: game.id,
        userId: user.id,
        score: parseInt(score),
        level: parseInt(level),
        hintsUsed: parseInt(hintsUsed) || 0,
        timeTakenSecs: timeTakenSecs ? parseInt(timeTakenSecs) : null,
      },
    });

    if (parseInt(score) > 0) {
      await db.user.update({ where: { id: user.id }, data: { xp: { increment: 15 } } });
      await checkGameAchievements(user.id);
      await checkProgressAchievements(user.id);
    }

    return NextResponse.json({
      success: true,
      score: gameScore.score,
      level: gameScore.level,
    });
  } catch (error) {
    console.error('Save game score error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ نتيجة اللعبة.' },
      { status: 500 }
    );
  }
}
