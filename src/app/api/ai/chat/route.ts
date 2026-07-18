import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { prompt, lessonId } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    // Fetch lesson context if lessonId is provided
    let lessonContext = '';
    if (lessonId) {
      const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
        select: { 
          title: true, 
          description: true, 
          contentChunks: { select: { content: true } } 
        }
      });
      if (lesson) {
        const chunksContent = lesson.contentChunks.map(c => c.content).join('\n');
        lessonContext = `عنوان الدرس: ${lesson.title}\nالوصف: ${lesson.description || ''}\nالمحتوى: ${chunksContent}`;
      }
    }
    
    let aiResponse = "";
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "أنت مساعد ذكي لمنصة أركان التعليمية. أجب بناءً على سياق الدرس التالي فقط إذا تم توفيره. كن مشجعاً واحترافياً. إذا سئلت عن تفاصيل ليست في الدرس قل أنك لا تملك هذه المعلومة في محتوى الدرس الحالي.\n" + lessonContext },
              { role: "user", content: prompt }
            ]
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          aiResponse = data.choices[0].message.content;
        } else {
          throw new Error("OpenAI API Error");
        }
      } catch (err) {
        console.error("OpenAI Error:", err);
        aiResponse = "عذراً، واجهت مشكلة في الاتصال بالخوادم الذكية. يمكنك سؤالي مرة أخرى لاحقاً.";
      }
    } else {
      // Mock sophisticated response
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("خطأ") || lowerPrompt.includes("error")) {
        aiResponse = "يبدو أنك تواجه خطأ برمجي. تأكد من مراجعة الكود الخاص بك في هذا الدرس (مراجعة المتغيرات وبنية الجمل). هل يمكنك توضيح رسالة الخطأ التي تظهر لك بالضبط لنتمكن من حلها معاً؟";
      } else if (lowerPrompt.includes("شرح") || lowerPrompt.includes("كيف")) {
        aiResponse = `في هذا الدرس (${lessonContext ? "الذي قمت بتوفير سياقه" : ""}) نركز على المفاهيم الأساسية المذكورة في الفيديو. لفهم هذه النقطة، حاول تطبيق الكود المرفق خطوة بخطوة وإعادة مشاهدة الجزء الأخير من الدرس.`;
      } else {
        aiResponse = "سؤال رائع! بناءً على محتوى هذا الدرس، أنصحك بالتركيز على التطبيق العملي. هل ترغب في أن أعطيك تحدياً صغيراً حول هذا الموضوع لتجربة مهارتك؟";
      }
    }

    // Save to AiChatLog
    await db.aiChatLog.create({
      data: {
        userId: user.id,
        lessonId: lessonId || null,
        prompt: prompt,
        response: aiResponse
      }
    });

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
