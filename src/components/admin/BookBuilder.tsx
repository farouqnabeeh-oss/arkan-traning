"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  AlertCircle,
  FileText,
  Package,
  Link2,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface BookFormData {
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImage: string;
  price: string;
  pdfFileKey: string;
  pagesCount: string;
  category: string;
  isPublished: boolean;
  bundleCourseId: string;
  bundlePrice: string;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BookBuilder({
  bookId,
  initialData,
}: {
  bookId?: string;
  initialData?: Partial<BookFormData>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState<BookFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    author: initialData?.author || "فريق أركان",
    description: initialData?.description || "",
    coverImage: initialData?.coverImage || "",
    price: initialData?.price?.toString() || "",
    pdfFileKey: initialData?.pdfFileKey || "",
    pagesCount: initialData?.pagesCount?.toString() || "",
    category: initialData?.category || "",
    isPublished: initialData?.isPublished || false,
    bundleCourseId: initialData?.bundleCourseId || "",
    bundlePrice: initialData?.bundlePrice?.toString() || "",
  });

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) =>
        setCourses(
          (d.courses || []).map((c: any) => ({ id: c.id, title: c.title })),
        ),
      );
  }, []);

  function update<K extends keyof BookFormData>(
    key: K,
    value: BookFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError("");
    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.pdfFileKey
    ) {
      setError("يرجى تعبئة العنوان والوصف والسعر ورابط ملف PDF على الأقل.");
      return;
    }
    setSaving(true);
    const res = await fetch(
      bookId ? `/api/admin/books/${bookId}` : "/api/admin/books",
      {
        method: bookId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حدث خطأ أثناء الحفظ.");
      setSaving(false);
      return;
    }
    router.push("/dashboard/admin/books");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <label className="text-sm text-brand-silver block mb-1.5">
            عنوان الكتاب *
          </label>
          <input
            value={form.title}
            onChange={(e) => {
              update("title", e.target.value);
            }}
            className="input-premium w-full"
          />
        </div>

        <div>
          <label className="text-sm text-brand-silver block mb-1.5">
            المؤلف
          </label>
          <input
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            className="input-premium w-full"
          />
        </div>
        <div>
          <label className="text-sm text-brand-silver block mb-1.5">
            الوصف *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            className="input-premium w-full resize-none"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">
              السعر (شيكل) *
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="input-premium w-full"
            />
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">
              عدد الصفحات
            </label>
            <input
              type="number"
              value={form.pagesCount}
              onChange={(e) => update("pagesCount", e.target.value)}
              className="input-premium w-full"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-brand-silver block mb-1.5">
            التصنيف
          </label>
          <input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="مثال: برمجة، بايثون"
            className="input-premium w-full"
          />
        </div>
        <div>
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => update("coverImage", url)}
            label="صورة الغلاف"
          />
        </div>
        <div>
          <label className="text-sm text-brand-silver block mb-1.5 flex items-center gap-2">
            <FileText size={15} className="text-brand-royal-light" /> ملف PDF أو
            رابط مباشر *
          </label>
          <input
            value={form.pdfFileKey}
            onChange={(e) => update("pdfFileKey", e.target.value)}
            placeholder="https://.../book.pdf أو رابط Drive/Dropbox"
            className="input-premium w-full font-mono text-sm"
            dir="ltr"
          />
          <p className="text-xs text-brand-silver-dim mt-1">
            يمكن إدخال رابط مباشر للملف أو رابط تخزين. سيتم حفظه كما هو للطالب
            عند السماح بالتحميل.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-brand-silver-dim">
          <div className="flex items-center gap-2 mb-2 text-brand-white">
            <Link2 size={15} className="text-brand-royal-light" /> ملاحظات مهمة
          </div>
          <ul className="list-disc pr-5 space-y-1">
            <li>استخدم رابط مناسب للملف حتى يكون متاحًا عند فتح الكتاب.</li>
            <li>
              يمكنك تخزين الملف في Google Drive أو Dropbox ثم وضع الرابط المباشر
              هنا.
            </li>
            <li>سيظهر الرابط للطالب فقط بعد الموافقة على طلب الشراء.</li>
          </ul>
        </div>
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update("isPublished", e.target.checked)}
            className="w-5 h-5 accent-brand-royal"
          />
          <span className="text-brand-white font-medium">
            نشر الكتاب في المكتبة الآن
          </span>
        </label>
      </div>

      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-brand-white flex items-center gap-2">
          <Package size={16} className="text-brand-royal-light" /> باقة مع دورة
          (اختياري)
        </h3>
        <p className="text-xs text-brand-silver-dim">
          اربط هذا الكتاب بدورة معينة وحدد سعر إجمالي مخفض عند شرائهم معًا.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">
              الدورة المرتبطة
            </label>
            <select
              value={form.bundleCourseId}
              onChange={(e) => update("bundleCourseId", e.target.value)}
              className="input-premium w-full text-sm"
            >
              <option value="">بدون باقة</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-brand-silver block mb-1.5">
              السعر الإجمالي للباقة (شيكل)
            </label>
            <input
              type="number"
              value={form.bundlePrice}
              onChange={(e) => update("bundlePrice", e.target.value)}
              disabled={!form.bundleCourseId}
              className="input-premium w-full text-sm disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="px-6 py-3 rounded-xl royal-gradient text-white font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}{" "}
        حفظ الكتاب
      </button>
    </div>
  );
}
