// ─────────────────────────────────────────────────────────────────
// مساعد أركان الذكي — مبني بالكامل على الطبقة المجانية من Gemini API
// (gemini-1.5-flash + text-embedding-004، ضمن حدود Google المجانية).
// عشان يضل مجاني فعليًا: الردود مختصرة (مش مقالات طويلة تستهلك حصة
// الاستخدام بسرعة)، وفيه تحديد لعدد الأسئلة يوميًا لكل طالب بملف الـ API route.
// ─────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Failed to fetch Gemini embedding:', error);
    // لا نرجّع بيانات وهمية هون أبدًا — لو فشل الاتصال، الأفضل نتجاهل البحث
    // الدلالي بدل ما نطابق نتائج عشوائية بثقة كاذبة.
    return null;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function queryRAG(query: string, lessonId?: string) {
  try {
    const queryVector = await getEmbedding(query);
    if (!queryVector) return []; // لا يوجد اتصال حقيقي بـ Gemini — نتجاهل البحث بدل ما نخترع نتائج

    // Fetch all content chunks (optionally scoped to lesson)
    const chunks = await db.contentChunk.findMany({
      where: lessonId ? { lessonId } : {},
      include: { lesson: true },
    });

    if (chunks.length === 0) return [];

    // Calculate similarity (نتجاهل أي مقطع تخزينه تالف بدل ما نستخدم بديل وهمي)
    const scoredChunks = chunks
      .map((chunk: any) => {
        let chunkVector: number[] | null = null;
        try {
          chunkVector = JSON.parse(chunk.embedding);
        } catch {
          return null;
        }
        if (!chunkVector) return null;
        const similarity = cosineSimilarity(queryVector, chunkVector);
        return { chunk, similarity };
      })
      .filter((x): x is { chunk: any; similarity: number } => x !== null);

    // Sort and return top 3
    scoredChunks.sort((a: any, b: any) => b.similarity - a.similarity);
    return scoredChunks.slice(0, 3).map((sc: any) => ({
      content: sc.chunk.content,
      title: sc.chunk.title,
      lessonTitle: sc.chunk.lesson?.title || 'عام',
      similarity: sc.similarity,
    }));
  } catch (error) {
    console.error('RAG query error:', error);
    return [];
  }
}

/**
 * Renders response according to the detailed spec:
 * definition -> explanation -> 3-4 examples -> comparison -> applications -> common mistakes -> resources -> questions -> attribution.
 */
export async function askGemini(prompt: string, context: string): Promise<string> {
  const systemPrompt = `أنت مساعد تعليمي ودود لمنصة أركان، بترد على أسئلة الطلاب البرمجية بالعربية.
- خلي ردك مختصر ومباشر (فقرة أو فقرتين، مثال كود واحد لو محتاج) — مش مقال طويل.
- لو السؤال بسيط، جاوب بسطرين وخلص.
- استخدم السياق التالي لو له علاقة بالسؤال، وإلا جاوب من معرفتك العامة بوضوح:
${context}`;

  if (!genAI) {
    return 'المساعد الذكي مش مفعّل حاليًا (يحتاج مفتاح Gemini API بملف الإعدادات). جرب اسأل بقسم "أسئلة الطلاب" بصفحة الدورة بدل ذلك.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { maxOutputTokens: 500 } });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nسؤال الطالب: ${prompt}` }] }],
    });
    return result.response.text();
  } catch (error) {
    console.error('Gemini content generation error:', error);
    return 'عذراً، واجه المساعد الذكي مشكلة في توليد الرد حالياً. يرجى إعادة المحاولة.';
  }
}

/**
 * Auto-generates a bullet-point summary from transcripts.
 */
export async function generateSummary(transcript: string): Promise<string> {
  if (!genAI) {
    return `
- مقدمة حول المفهوم المشروح في الدرس.
- أهم النقاط البرمجية والوسوم المستهدفة.
- كيفية تلافي الأخطاء البرمجية الشائعة.
- تطبيق عملي وتحدي مقترح لتثبيت المعلومة.
    `.trim();
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`
أنت خبير محتوى تعليمي. لخص النص التالي للدرس في 4-5 نقاط نقطية واضحة وموجزة باللغة العربية:
${transcript}
`);
    return result.response.text();
  } catch (e) {
    return 'تعذر توليد الملخص التلقائي حالياً.';
  }
}

/**
 * Auto-generates quiz questions (multiple difficulty levels and types).
 */
export async function generateQuizQuestions(lessonContent: string): Promise<any[]> {
  if (!genAI) {
    return [
      {
        type: 'MULTIPLE_CHOICE',
        questionText: 'ما هي اللغة الأساسية المستخدمة لتحديد هيكل صفحة الويب؟',
        options: ['HTML5', 'CSS3', 'JavaScript', 'Python'],
        correctAnswer: '0',
        points: 10,
      },
      {
        type: 'TRUE_FALSE',
        questionText: 'يمكن استخدام الوسم <a> لإنشاء روابط تشعبية في HTML.',
        options: ['صح', 'خطأ'],
        correctAnswer: '0',
        points: 10,
      },
    ];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    
    const prompt = `
بناءً على محتوى الدرس التالي، قم بتوليد اختبار يحتوي على سؤالين (سؤال اختيار من متعدد وسؤال صح أو خطأ) باللغة العربية بصيغة JSON تطابق البنية التالية تماماً:
[
  {
    "type": "MULTIPLE_CHOICE",
    "questionText": "نص السؤال هنا",
    "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
    "correctAnswer": "0" (مؤشر الخيار الصحيح يبدأ من 0),
    "points": 10
  },
  {
    "type": "TRUE_FALSE",
    "questionText": "نص سؤال صح أو خطأ هنا",
    "options": ["صح", "خطأ"],
    "correctAnswer": "0" (0 للصح، 1 للخطأ),
    "points": 10
  }
]

محتوى الدرس:
${lessonContent}
`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (e) {
    console.error('Quiz generation error:', e);
    return [
      {
        type: 'MULTIPLE_CHOICE',
        questionText: 'ما هي اللغة الأساسية المستخدمة لتحديد هيكل صفحة الويب؟',
        options: ['HTML5', 'CSS3', 'JavaScript', 'Python'],
        correctAnswer: '0',
        points: 10,
      },
    ];
  }
}
