'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, Video,
  BookOpen, ListChecks, Rocket, X, GripVertical, Play, AlertCircle,
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Lesson {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  isPublished: boolean;
}
interface ModuleItem {
  title: string;
  lessons: Lesson[];
}
interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  compareAtPrice: string;
  image: string;
  trailerUrl: string;
  level: string;
  language: string;
  category: string;
  whatYoullLearn: string[];
  requirements: string[];
  targetAudience: string[];
  isPublished: boolean;
  modules: ModuleItem[];
}

const emptyLesson = (): Lesson => ({ title: '', description: '', videoUrl: '', duration: '', isPublished: true });
const emptyModule = (): ModuleItem => ({ title: '', lessons: [emptyLesson()] });

const LEVELS = [
  { value: 'BEGINNER', label: 'مبتدئ' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'متقدم' },
  { value: 'ALL_LEVELS', label: 'كل المستويات' },
];

const TABS = [
  { id: 'basic', label: 'معلومات أساسية', icon: BookOpen },
  { id: 'details', label: 'التفاصيل التسويقية', icon: ListChecks },
  { id: 'curriculum', label: 'المنهج والفيديوهات', icon: Video },
  { id: 'publish', label: 'النشر', icon: Rocket },
];

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CourseBuilder({
  courseId,
  initialData,
}: {
  courseId?: string;
  initialData?: Partial<CourseFormData>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);

  const [form, setForm] = useState<CourseFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price?.toString() || '',
    compareAtPrice: initialData?.compareAtPrice?.toString() || '',
    image: initialData?.image || '',
    trailerUrl: initialData?.trailerUrl || '',
    level: initialData?.level || 'ALL_LEVELS',
    language: initialData?.language || 'العربية',
    category: initialData?.category || '',
    whatYoullLearn: initialData?.whatYoullLearn?.length ? initialData.whatYoullLearn : [''],
    requirements: initialData?.requirements?.length ? initialData.requirements : [''],
    targetAudience: initialData?.targetAudience?.length ? initialData.targetAudience : [''],
    isPublished: initialData?.isPublished || false,
    modules: initialData?.modules?.length ? initialData.modules : [emptyModule()],
  });

  function update<K extends keyof CourseFormData>(key: K, value: CourseFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value: string) {
    update('title', value);
  }

  // ─── قوائم نصية (ماذا ستتعلم / المتطلبات / الفئة المستهدفة) ───
  function updateListItem(field: 'whatYoullLearn' | 'requirements' | 'targetAudience', idx: number, value: string) {
    const list = [...form[field]];
    list[idx] = value;
    update(field, list);
  }
  function addListItem(field: 'whatYoullLearn' | 'requirements' | 'targetAudience') {
    update(field, [...form[field], '']);
  }
  function removeListItem(field: 'whatYoullLearn' | 'requirements' | 'targetAudience', idx: number) {
    update(field, form[field].filter((_, i) => i !== idx));
  }

  // ─── الموديولات والدروس ───
  function updateModule(mIdx: number, patch: Partial<ModuleItem>) {
    const modules = [...form.modules];
    modules[mIdx] = { ...modules[mIdx], ...patch };
    update('modules', modules);
  }
  function addModule() {
    update('modules', [...form.modules, emptyModule()]);
  }
  function removeModule(mIdx: number) {
    update('modules', form.modules.filter((_, i) => i !== mIdx));
  }
  function moveModule(mIdx: number, dir: -1 | 1) {
    const modules = [...form.modules];
    const target = mIdx + dir;
    if (target < 0 || target >= modules.length) return;
    [modules[mIdx], modules[target]] = [modules[target], modules[mIdx]];
    update('modules', modules);
  }

  function updateLesson(mIdx: number, lIdx: number, patch: Partial<Lesson>) {
    const modules = [...form.modules];
    const lessons = [...modules[mIdx].lessons];
    lessons[lIdx] = { ...lessons[lIdx], ...patch };
    modules[mIdx] = { ...modules[mIdx], lessons };
    update('modules', modules);
  }
  function addLesson(mIdx: number) {
    const modules = [...form.modules];
    modules[mIdx] = { ...modules[mIdx], lessons: [...modules[mIdx].lessons, emptyLesson()] };
    update('modules', modules);
  }
  function removeLesson(mIdx: number, lIdx: number) {
    const modules = [...form.modules];
    modules[mIdx] = { ...modules[mIdx], lessons: modules[mIdx].lessons.filter((_, i) => i !== lIdx) };
    update('modules', modules);
  }

  async function handleSubmit(publishNow?: boolean) {
    setError('');
    if (!form.title || !form.description || !form.price) {
      setError('يرجى تعبئة العنوان والوصف والسعر على الأقل (تبويب "معلومات أساسية").');
      setTab('basic');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        isPublished: publishNow !== undefined ? publishNow : form.isPublished,
        whatYoullLearn: form.whatYoullLearn.filter((x) => x.trim()),
        requirements: form.requirements.filter((x) => x.trim()),
        targetAudience: form.targetAudience.filter((x) => x.trim()),
      };

      const res = await fetch(
        courseId ? `/api/admin/courses/${courseId}` : '/api/admin/courses',
        {
          method: courseId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'حدث خطأ أثناء الحفظ.');
        setSaving(false);
        return;
      }
      router.push('/dashboard/admin/courses');
      router.refresh();
    } catch {
      setError('تعذر الاتصال بالخادم.');
      setSaving(false);
    }
  }

  const totalLessons = form.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-brand-royal/15 text-brand-royal-light border-b-2 border-brand-royal'
                  : 'text-brand-silver-dim hover:text-brand-silver'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── معلومات أساسية ── */}
      {tab === 'basic' && (
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-5">
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">عنوان الدورة *</label>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="مثال: أساسيات لغة بايثون من الصفر للاحتراف"
              className="input-premium w-full"
            />
          </div>

          <div>
            <label className="text-sm text-brand-silver block mb-1.5">وصف قصير (يظهر بكارت الدورة)</label>
            <input
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
              placeholder="جملة واحدة قوية تلخص الدورة"
              className="input-premium w-full"
            />
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">الوصف الكامل *</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={6}
              className="input-premium w-full resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-brand-silver block mb-1.5">السعر (شيكل) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="input-premium w-full"
              />
            </div>
            <div>
              <label className="text-sm text-brand-silver block mb-1.5">
                السعر قبل الخصم <span className="text-xs text-brand-silver-dim">(اختياري)</span>
              </label>
              <input
                type="number"
                value={form.compareAtPrice}
                onChange={(e) => update('compareAtPrice', e.target.value)}
                className="input-premium w-full"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-brand-silver block mb-1.5">المستوى</label>
              <select
                value={form.level}
                onChange={(e) => update('level', e.target.value)}
                className="input-premium w-full"
              >
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-brand-silver block mb-1.5">اللغة</label>
              <input
                value={form.language}
                onChange={(e) => update('language', e.target.value)}
                className="input-premium w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">
              التصنيف / المسار التعليمي
              <span className="text-xs text-brand-silver-dim mr-2">(مثال: بايثون، تطوير ويب، تصميم)</span>
            </label>
            <input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="بايثون"
              className="input-premium w-full"
            />
          </div>
          <div>
            <ImageUpload
              value={form.image}
              onChange={(url) => update('image', url)}
              label="صورة الغلاف"
            />
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5 flex items-center gap-2">
              <Play size={15} className="text-brand-royal-light" /> رابط فيديو تعريفي (يوتيوب)
            </label>
            <input
              value={form.trailerUrl}
              onChange={(e) => update('trailerUrl', e.target.value)}
              placeholder="https://youtu.be/..."
              className="input-premium w-full font-mono text-sm"
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* ── التفاصيل التسويقية ── */}
      {tab === 'details' && (
        <div className="space-y-4">
          {([
            ['whatYoullLearn', 'ماذا سيتعلم الطالب', 'مثال: بناء موقع كامل بلغة بايثون'],
            ['requirements', 'المتطلبات المسبقة', 'مثال: معرفة أساسية بالحاسوب'],
            ['targetAudience', 'الفئة المستهدفة', 'مثال: المبتدئين الراغبين بدخول عالم البرمجة'],
          ] as const).map(([field, label, placeholder]) => (
            <div key={field} className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold text-brand-white mb-4">{label}</h3>
              <div className="space-y-2">
                {form[field].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(e) => updateListItem(field, idx, e.target.value)}
                      placeholder={placeholder}
                      className="input-premium flex-1 text-sm"
                    />
                    <button onClick={() => removeListItem(field, idx)} className="text-red-400/70 hover:text-red-400 p-2">
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => addListItem(field)}
                className="mt-3 flex items-center gap-1.5 text-sm text-brand-royal-light hover:text-brand-royal"
              >
                <Plus size={14} /> إضافة نقطة
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── المنهج والفيديوهات ── */}
      {tab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-silver-dim">
              {form.modules.length} موديول · {totalLessons} درس
            </p>
          </div>

          <div className="bg-brand-royal/8 border border-brand-royal/20 rounded-xl p-4 text-xs text-brand-silver flex gap-2">
            <Video size={16} className="text-brand-royal-light shrink-0 mt-0.5" />
            <span>
              ارفع فيديو الدرس كـ "غير مدرج" (Unlisted) على يوتيوب وانسخ رابطه هون. هذا الحل مجاني بالكامل وسريع عالميًا.
              الفيديو ما رح يظهر بنتائج البحث أو قناتك العامة، بس أي حد معاه الرابط المباشر يقدر يوصله.
            </span>
          </div>

          {form.modules.map((mod, mIdx) => (
            <div key={mIdx} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-white/5">
                <GripVertical size={16} className="text-brand-silver-dim" />
                <input
                  value={mod.title}
                  onChange={(e) => updateModule(mIdx, { title: e.target.value })}
                  placeholder={`عنوان الموديول ${mIdx + 1}`}
                  className="input-premium flex-1 text-sm font-bold"
                />
                <button onClick={() => moveModule(mIdx, -1)} disabled={mIdx === 0} className="text-brand-silver-dim hover:text-brand-white disabled:opacity-20 p-1">
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => moveModule(mIdx, 1)} disabled={mIdx === form.modules.length - 1} className="text-brand-silver-dim hover:text-brand-white disabled:opacity-20 p-1">
                  <ChevronDown size={16} />
                </button>
                <button onClick={() => removeModule(mIdx)} className="text-red-400/70 hover:text-red-400 p-1">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {mod.lessons.map((lesson, lIdx) => (
                  <div key={lIdx} className="p-4 bg-white/5 rounded-xl space-y-3 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-royal-light font-bold">الدرس {lIdx + 1}</span>
                      <button onClick={() => removeLesson(mIdx, lIdx)} className="text-red-400/70 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      value={lesson.title}
                      onChange={(e) => updateLesson(mIdx, lIdx, { title: e.target.value })}
                      placeholder="عنوان الدرس"
                      className="input-premium w-full text-sm"
                    />
                    <textarea
                      value={lesson.description}
                      onChange={(e) => updateLesson(mIdx, lIdx, { description: e.target.value })}
                      placeholder="وصف مختصر للدرس (اختياري)"
                      rows={2}
                      className="input-premium w-full text-sm resize-none"
                    />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <input
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(mIdx, lIdx, { videoUrl: e.target.value })}
                        placeholder="رابط فيديو يوتيوب"
                        className="input-premium sm:col-span-2 text-sm font-mono"
                        dir="ltr"
                      />
                      <input
                        type="number"
                        value={lesson.duration}
                        onChange={(e) => updateLesson(mIdx, lIdx, { duration: e.target.value })}
                        placeholder="المدة (دقيقة)"
                        className="input-premium text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-brand-silver-dim cursor-pointer w-fit">
                      <input
                        type="checkbox"
                        checked={lesson.isPublished}
                        onChange={(e) => updateLesson(mIdx, lIdx, { isPublished: e.target.checked })}
                        className="accent-brand-royal"
                      />
                      منشور للطلاب
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => addLesson(mIdx)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-brand-royal/30 text-sm text-brand-royal-light hover:bg-brand-royal/5 flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> إضافة درس
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addModule}
            className="w-full py-3.5 rounded-xl bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal-light font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} /> إضافة موديول جديد
          </button>
        </div>
      )}

      {/* ── النشر ── */}
      {tab === 'publish' && (
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="p-4 rounded-xl bg-white/5 space-y-2 text-sm text-brand-silver">
            <p><strong className="text-brand-white">العنوان:</strong> {form.title || '—'}</p>
            <p><strong className="text-brand-white">السعر:</strong> {form.price || '0'} ₪</p>
            <p><strong className="text-brand-white">عدد الموديولات:</strong> {form.modules.length}</p>
            <p><strong className="text-brand-white">عدد الدروس:</strong> {totalLessons}</p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update('isPublished', e.target.checked)}
              className="w-5 h-5 accent-brand-royal"
            />
            <span className="text-brand-white font-medium">نشر الدورة الآن (تصبح ظاهرة للطلاب فورًا)</span>
          </label>
        </div>
      )}

      {/* أزرار الحفظ */}
      <div className="flex flex-wrap gap-3 sticky bottom-4 z-10">
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-brand-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          حفظ كمسودة
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="px-6 py-3 rounded-xl royal-gradient text-white font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
          حفظ ونشر
        </button>
      </div>
    </div>
  );
}
