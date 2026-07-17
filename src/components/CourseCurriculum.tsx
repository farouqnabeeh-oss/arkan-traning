'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Video, HelpCircle, FileText, CheckCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  slug: string;
  quizzes?: any[];
  assignments?: any[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function CourseCurriculum({ modules }: { modules: Module[] }) {
  const [openModuleIds, setOpenModuleIds] = useState<string[]>([modules[0]?.id]);

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقيقة`;
  };

  return (
    <div className="space-y-4">
      {modules.map((mod, index) => {
        const isOpen = openModuleIds.includes(mod.id);
        return (
          <div
            key={mod.id}
            className="border border-brand-royal/20 glass-dark rounded-xl overflow-hidden"
          >
            {/* Module header */}
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full text-right px-6 py-5 flex items-center justify-between gap-4 bg-brand-royal/5 hover:bg-brand-royal/10 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-royal/20 text-brand-royal-light font-bold flex items-center justify-center text-sm font-inter">
                  {index + 1}
                </span>
                <span className="text-lg font-tajawal font-bold text-brand-white">
                  {mod.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-brand-white/40 text-sm font-tajawal">
                <span>{mod.lessons.length} دروس</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-royal transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Lessons List */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="border-t border-brand-royal/10 divide-y divide-brand-royal/5">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-royal/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-4 h-4 text-brand-royal/70" />
                          <span className="text-base font-tajawal font-medium text-brand-white/80">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm font-tajawal text-brand-white/40 mr-7 sm:mr-0">
                          <span>{formatDuration(lesson.duration)}</span>
                          
                          {/* Quiz indicator */}
                          {lesson.quizzes && lesson.quizzes.length > 0 && (
                            <span className="flex items-center gap-1 text-brand-royal-light bg-brand-royal/10 px-2 py-0.5 rounded border border-brand-royal/20">
                              <HelpCircle className="w-3.5 h-3.5" />
                              اختبار
                            </span>
                          )}

                          {/* Assignment indicator */}
                          {lesson.assignments && lesson.assignments.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              <FileText className="w-3.5 h-3.5" />
                              واجب
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
