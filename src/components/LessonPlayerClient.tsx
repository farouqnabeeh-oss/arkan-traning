'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from './VideoPlayer';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  MessageSquare,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  duration: number;
  quizzes?: any[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Note {
  id: string;
  content: string;
  timestamp: number;
  createdAt: string;
}

export default function LessonPlayerClient({
  course,
  modules,
  currentLesson,
  enrollmentId,
  initialNotes,
  initialProgresses,
  userEmail,
}: {
  course: any;
  modules: any[];
  currentLesson: any;
  enrollmentId: string;
  initialNotes: Note[];
  initialProgresses: any[];
  userEmail: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'quiz' | 'ai'>('description');
  
  // Progress states
  const [progresses, setProgresses] = useState<any[]>(initialProgresses);
  const [isCurrentLessonCompleted, setIsCurrentLessonCompleted] = useState(
    initialProgresses.some((p) => p.lessonId === currentLesson.id && p.isCompleted)
  );

  // Notes states
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    isPassed: boolean;
    correctAnswers?: { [qId: string]: string };
    gradingResults?: { [qId: string]: boolean };
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // AI Assistant states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'مرحباً بك! أنا مساعد أركان الذكي. كيف يمكنني مساعدتك اليوم في فهم محتوى هذا الدرس؟ يمكنك سؤالي عن المفاهيم البرمجية أو طلب أمثلة.',
    },
  ]);
  const [askingAi, setAskingAi] = useState(false);

  // Refresh completion state when lesson changes
  useEffect(() => {
    setIsCurrentLessonCompleted(
      progresses.some((p) => p.lessonId === currentLesson.id && p.isCompleted)
    );
    setQuizResult(null);
    setQuizAnswers({});
    
    // Load notes for current lesson
    async function loadNotes() {
      try {
        const res = await fetch(`/api/player/notes?lessonId=${currentLesson.id}`);
        const data = await res.json();
        if (data.success) {
          setNotes(data.notes);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadNotes();
  }, [currentLesson, progresses]);

  const lastSavedRef = React.useRef(0);

  const handleVideoProgress = (currentTime: number, duration: number) => {
    // If user watched at least 80% of the video, auto mark as completed
    if (duration > 0 && currentTime / duration >= 0.8 && !isCurrentLessonCompleted) {
      markLessonCompleted();
    }
    // حفظ نقطة المشاهدة كل 10 ثواني لدعم استئناف المشاهدة لاحقًا
    if (currentTime - lastSavedRef.current >= 10) {
      lastSavedRef.current = currentTime;
      fetch('/api/player/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: course.slug, lessonId: currentLesson.id, watchTime: currentTime }),
      }).catch(() => {});
    }
  };

  const markLessonCompleted = async () => {
    try {
      const res = await fetch('/api/player/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          lessonId: currentLesson.id,
          isCompleted: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCurrentLessonCompleted(true);
        // Update local progresses state
        setProgresses((prev) => {
          const exists = prev.some((p) => p.lessonId === currentLesson.id);
          if (exists) {
            return prev.map((p) => (p.lessonId === currentLesson.id ? { ...p, isCompleted: true } : p));
          }
          return [...prev, { lessonId: currentLesson.id, isCompleted: true }];
        });
        
        if (data.certificateCreated) {
          alert(`🎓 تهانينا! لقد أتممت الدورة بنجاح وصدرت شهادتك برقم التحقق: ${data.verificationId}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSavingNote(true);
    const video = document.querySelector('video');
    const timestamp = video ? video.currentTime : 0;

    try {
      const res = await fetch('/api/player/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          content: noteContent.trim(),
          timestamp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [...prev, data.note].sort((a, b) => a.timestamp - b.timestamp));
        setNoteContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const jumpToTime = (seconds: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = seconds;
      video.play().catch(() => {});
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson.quizzes?.[0]) return;
    
    setSubmittingQuiz(true);
    try {
      const res = await fetch('/api/player/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: currentLesson.quizzes[0].id,
          answers: quizAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuizResult({
          score: data.score,
          isPassed: data.isPassed,
          correctAnswers: data.correctAnswers,
          gradingResults: data.gradingResults,
        });

        if (data.isPassed) {
          markLessonCompleted();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || askingAi) return;

    const query = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: query }]);
    setChatInput('');
    setAskingAi(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          lessonId: currentLesson.id,
        }),
      });

      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: data.response || 'عذراً، واجه المساعد مشكلة في الرد.' },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'تعذر الاتصال بالخادم الذكي. يرجى مراجعة إعدادات الشبكة.' },
      ]);
    } finally {
      setAskingAi(false);
    }
  };

  const formatNoteTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] font-tajawal text-right">
      
      {/* 1. Main Player Container (Left/Center in RTL, take up 70% width) */}
      <div className="flex-grow p-6 space-y-6 lg:max-w-[70%]">
        
        {/* Video Player */}
        <VideoPlayer
          videoUrl={currentLesson.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} // Default fallback mp4
          watermarkText={userEmail}
          startAt={initialProgresses.find((p) => p.lessonId === currentLesson.id)?.watchTime || 0}
          onProgress={handleVideoProgress}
          onEnded={markLessonCompleted}
        />

        {/* Lesson Metadata Header */}
        <div className="bg-brand-white p-6 rounded-2xl border border-brand-royal/10 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-brand-dark">{currentLesson.title}</h1>
            <p className="text-brand-dark/50 text-xs font-inter">مدة الدرس: {Math.floor(currentLesson.duration / 60)} دقيقة</p>
          </div>
          <button
            onClick={markLessonCompleted}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${
              isCurrentLessonCompleted
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-brand-navy text-brand-royal border-brand-royal/30 hover:border-brand-royal'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isCurrentLessonCompleted ? 'تم إكمال الدرس' : 'تحديد كمكتمل'}
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="bg-brand-white border border-brand-royal/10 rounded-2xl p-2 flex gap-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'description' ? 'bg-brand-navy text-brand-royal' : 'text-brand-dark/60 hover:text-brand-royal'
            }`}
          >
            الوصف والملخص
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'notes' ? 'bg-brand-navy text-brand-royal' : 'text-brand-dark/60 hover:text-brand-royal'
            }`}
          >
            الملاحظات الشخصية
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'quiz' ? 'bg-brand-navy text-brand-royal' : 'text-brand-dark/60 hover:text-brand-royal'
            }`}
          >
            اختبر نفسك
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai' ? 'bg-brand-navy text-brand-royal' : 'text-brand-dark/60 hover:text-brand-royal'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-royal animate-pulse" />
            المساعد الذكي
          </button>
        </div>

        {/* Tabs Content */}
        <div className="bg-brand-white p-6 rounded-2xl border border-brand-royal/10 min-h-[300px]">
          
          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">وصف الدرس</h3>
                <p className="text-brand-dark/80 text-sm leading-relaxed">
                  {currentLesson.description || 'لا يوجد وصف متاح لهذا الدرس.'}
                </p>
              </div>
              <hr className="border-brand-royal/5" />
              <div>
                <h3 className="text-lg font-bold text-brand-dark mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-royal" />
                  الملخص التلقائي للدرس (ذكاء اصطناعي)
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-brand-dark/75 mr-4">
                  <li>فهم المفاهيم الأساسية المشروحة في هذا المقطع.</li>
                  <li>تطبيق الكود البرمجي خطوة بخطوة كما هو معروض في الشرح.</li>
                  <li>التحقق من الأخطاء الإملائية الشائعة وعلامات الترقيم البرمجية.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-brand-dark">الملاحظات الدراسية المؤقتة</h3>
              
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="اكتب ملاحظة لتدوينها في هذا الوقت المحدد..."
                  className="flex-grow px-4 py-3 border border-brand-royal/25 rounded-xl bg-brand-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-royal text-sm"
                />
                <button
                  type="submit"
                  disabled={savingNote}
                  className="bg-brand-navy hover:bg-brand-navy/95 border border-brand-royal/30 hover:border-brand-royal text-brand-royal px-6 rounded-xl font-bold text-sm transition-all"
                >
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                </button>
              </form>

              {/* Notes List */}
              {notes.length === 0 ? (
                <p className="text-brand-dark/50 text-sm py-4 text-center">لا توجد ملاحظات مدونة بعد. تظهر ملاحظاتك هنا مرتبطة بوقت تشغيل الفيديو.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => jumpToTime(note.timestamp)}
                      className="p-3 bg-brand-beige/25 hover:bg-brand-beige/50 border border-brand-royal/10 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="text-xs font-bold text-brand-royal font-inter bg-brand-navy px-2 py-1 rounded">
                        {formatNoteTime(note.timestamp)}
                      </span>
                      <p className="text-sm font-tajawal text-brand-dark text-right flex-grow mr-4">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              {!currentLesson.quizzes || currentLesson.quizzes.length === 0 ? (
                <p className="text-brand-dark/50 text-sm py-4 text-center">لا يوجد اختبار مسجل لهذا الدرس.</p>
              ) : (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-brand-royal/10">
                    <h3 className="text-lg font-bold text-brand-dark">{currentLesson.quizzes[0].title}</h3>
                    <p className="text-xs text-brand-dark/50 mt-1">الحد الأدنى للاجتياز: {currentLesson.quizzes[0].passingScore}%</p>
                  </div>

                  {quizResult ? (
                    <div className="space-y-4 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold ${
                        quizResult.isPassed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {quizResult.score}%
                      </div>
                      <h4 className={`text-xl font-bold ${quizResult.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {quizResult.isPassed ? 'تهانينا! لقد اجتزت الاختبار بنجاح' : 'للأسف، لم تجتز الاختبار هذه المرة'}
                      </h4>
                      <p className="text-sm text-brand-dark/70">
                        {quizResult.isPassed
                          ? 'يمكنك الآن مواصلة الشرح والانتقال للدرس التالي.'
                          : 'يرجى مراجعة الدرس مرة أخرى وإعادة الاختبار للحصول على علامة الاجتياز.'}
                      </p>
                      <button
                        onClick={() => setQuizResult(null)}
                        className="bg-brand-navy border border-brand-royal/30 text-brand-royal px-6 py-2 rounded-lg text-sm font-bold"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleQuizSubmit} className="space-y-8">
                      {currentLesson.quizzes[0].questions?.map((q: any, qIdx: number) => (
                        <div key={q.id} className="space-y-3">
                          <h4 className="text-base font-bold text-brand-dark flex items-start gap-2">
                            <span className="font-inter font-bold text-brand-royal">{qIdx + 1}.</span>
                            <span>{q.questionText}</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-2 mr-6">
                            {q.options?.map((opt: string, optIdx: number) => (
                              <label
                                key={optIdx}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer text-sm font-tajawal transition-all ${
                                  quizAnswers[q.id] === String(optIdx)
                                    ? 'border-brand-royal bg-brand-royal/5 text-brand-dark font-bold'
                                    : 'border-brand-royal/10 bg-brand-white text-brand-dark/80 hover:bg-brand-beige/20'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  required
                                  checked={quizAnswers[q.id] === String(optIdx)}
                                  onChange={() =>
                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: String(optIdx) }))
                                  }
                                  className="h-4 w-4 text-brand-royal focus:ring-brand-royal"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        type="submit"
                        disabled={submittingQuiz}
                        className="w-full py-3 rounded-xl font-bold text-brand-dark royal-gradient hover:royal-gradient-hover hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {submittingQuiz ? 'جاري تصحيح الاختبار...' : 'تقديم إجابات الاختبار'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: AI Assistant */}
          {activeTab === 'ai' && (
            <div className="flex flex-col h-[400px] justify-between">
              {/* Chat history */}
              <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 max-h-[320px]">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-lg text-sm leading-relaxed text-right ${
                        msg.role === 'user'
                          ? 'bg-brand-navy text-brand-royal border border-brand-royal/20'
                          : 'bg-brand-beige/50 text-brand-dark border border-brand-royal/10'
                      }`}
                    >
                      {msg.text.split('\n').map((para, pIdx) => (
                        <p key={pIdx} className="mb-2 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {askingAi && (
                  <div className="flex items-end flex-col">
                    <div className="bg-brand-beige/50 text-brand-dark p-3 rounded-2xl border border-brand-royal/10 flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-royal" />
                      <span>جاري معالجة السؤال برمجياً...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskAi} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اسأل المساعد الذكي عن أي نقطة برمجية..."
                  className="flex-grow px-4 py-3 border border-brand-royal/25 rounded-xl bg-brand-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-royal text-sm"
                />
                <button
                  type="submit"
                  disabled={askingAi || !chatInput.trim()}
                  className="bg-brand-navy hover:bg-brand-navy/95 border border-brand-royal/30 hover:border-brand-royal text-brand-royal p-3 px-5 rounded-xl font-bold text-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* 2. Sidebar Modules/Lessons Navigation (Right side in RTL, take up 30% width) */}
      <div className="w-full lg:w-[30%] bg-brand-white border-r border-brand-royal/10 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="pb-4 border-b border-brand-royal/10 text-right">
          <h2 className="text-lg font-bold text-brand-dark">محتوى المسار التدريبي</h2>
          <span className="text-xs text-brand-dark/50 font-inter">دورة: {course.title}</span>
        </div>

        <div className="space-y-6">
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="space-y-2">
              <h3 className="text-sm font-bold text-brand-royal/80 flex items-center gap-2 justify-start">
                <span className="font-inter">الوحدة {modIdx + 1}:</span>
                <span>{mod.title}</span>
              </h3>

              <div className="space-y-1 pr-2">
                {mod.lessons.map((lesson: any) => {
                  const isCurrent = lesson.id === currentLesson.id;
                  const isCompleted = progresses.some((p) => p.lessonId === lesson.id && p.isCompleted);
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => router.push(`/player/${course.slug}/${lesson.slug}`)}
                      className={`w-full text-right p-3 rounded-xl flex items-center justify-between text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-brand-navy text-brand-royal border border-brand-royal/30 font-bold'
                          : 'text-brand-dark/80 hover:bg-brand-beige/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-dark/40 font-inter">
                        <span>{Math.floor(lesson.duration / 60)}د</span>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-brand-dark/30" />
                        )}
                      </div>
                      <span className="text-sm truncate max-w-[170px]">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
