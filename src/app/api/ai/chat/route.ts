import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { queryRAG, askGemini } from '@/lib/ai';
import { isRateLimited } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    // حد أقصى 20 سؤال باليوم لكل طالب — يحمي حصة Gemini المجانية من الاستنزاف
    if (isRateLimited(`ai-chat:${user.id}`, 20, 24 * 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'وصلت للحد الأقصى من الأسئلة اليومية للمساعد الذكي (20 سؤال). جرب قسم "أسئلة الطلاب" بصفحة الدورة، أو ارجع بكرة.' },
        { status: 429 }
      );
    }

    const { prompt, lessonId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'يرجى كتابة سؤالك أولاً.' }, { status: 400 });
    }

    // 1. Fetch relevant chunks using RAG semantic search
    const matchingChunks = await queryRAG(prompt, lessonId || undefined);

    // 2. Format context details
    let contextText = '';
    if (matchingChunks.length > 0) {
      contextText = matchingChunks
        .map((c) => `[المصدر: درس "${c.lessonTitle}" - قسم: "${c.title}"]\n${c.content}`)
        .join('\n\n');
    } else {
      contextText = 'لا توجد مستندات مباشرة مطابقة تماماً. أجب بناءً على معرفتك العامة بصفتك مساعد برمجيات أركان.';
    }

    // 3. Generate response from Gemini
    const aiResponse = await askGemini(prompt, contextText);

    // 4. Log the query
    await db.aiChatLog.create({
      data: {
        userId: user.id,
        lessonId: lessonId || null,
        prompt,
        response: aiResponse,
      },
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sources: matchingChunks.map((c) => ({
        lesson: c.lessonTitle,
        section: c.title,
      })),
    });
  } catch (error) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة استفسارك بواسطة الذكاء الاصطناعي.' },
      { status: 500 }
    );
  }
}
