"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Type,
  Variable,
  Minus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bold,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Palette,
  Stamp,
} from "lucide-react";
import CertificateRenderer, {
  CertElement,
  VARIABLE_LABELS,
} from "@/components/CertificateRenderer";
import ImageUpload from "@/components/ImageUpload";

const PREVIEW_VARS = {
  STUDENT_NAME: "اسم الطالب هنا",
  COURSE_TITLE: "اسم الدورة التدريبية",
  DATE: new Date().toLocaleDateString("ar-EG"),
  VERIFICATION_ID: "ARK-A1B2C3D4",
};

function newId() {
  return `el_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export default function CertificateTemplateBuilder({
  fetchUrl,
  saveUrl,
  title,
}: {
  fetchUrl: string;
  saveUrl: string;
  title: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("قالب مخصص");
  const [backgroundColor, setBackgroundColor] = useState("#0F1830");
  const [sealImage, setSealImage] = useState<string>("");
  const [elements, setElements] = useState<CertElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragState = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    fetch(fetchUrl)
      .then((r) => r.json())
      .then((d) => {
        if (d.template) {
          setName(d.template.name);
          setBackgroundColor(d.template.backgroundColor);
          setSealImage(d.template.sealImage || "");
          const rawElements = d.template.elements;
          setElements(
            typeof rawElements === "string"
              ? JSON.parse(rawElements)
              : rawElements || [],
          );
        }
        setLoading(false);
      });
  }, [fetchUrl]);

  const selected = elements.find((e) => e.id === selectedId) || null;

  function updateSelected(patch: Partial<CertElement>) {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)),
    );
  }

  function addElement(type: CertElement["type"], variable?: string) {
    const el: CertElement = {
      id: newId(),
      type,
      content: type === "text" ? "نص جديد" : undefined,
      variable: type === "variable" ? variable : undefined,
      x: 30,
      y: 45,
      width: 40,
      fontSize: type === "divider" ? 0 : 18,
      color: "#F2F5FA",
      fontWeight: "normal",
      textAlign: "center",
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  function removeSelected() {
    if (!selectedId) return;
    setElements((prev) => prev.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elId: string) => {
      e.preventDefault();
      setSelectedId(elId);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const el = elements.find((x) => x.id === elId);
      if (!el) return;
      const elPxX = (el.x / 100) * rect.width;
      const elPxY = (el.y / 100) * rect.height;
      dragState.current = {
        id: elId,
        offsetX: e.clientX - rect.left - elPxX,
        offsetY: e.clientY - rect.top - elPxY,
      };
    },
    [elements],
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragState.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      let xPct =
        ((e.clientX - rect.left - dragState.current.offsetX) / rect.width) *
        100;
      let yPct =
        ((e.clientY - rect.top - dragState.current.offsetY) / rect.height) *
        100;
      xPct = Math.max(0, Math.min(95, xPct));
      yPct = Math.max(0, Math.min(95, yPct));
      const id = dragState.current.id;
      setElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? {
                ...el,
                x: Math.round(xPct * 10) / 10,
                y: Math.round(yPct * 10) / 10,
              }
            : el,
        ),
      );
    }
    function handleMouseUp() {
      dragState.current = null;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch(saveUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, backgroundColor, elements, sealImage }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "حدث خطأ أثناء الحفظ.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-brand-silver-dim py-16">
        <Loader2 className="animate-spin" size={18} /> جارِ التحميل...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* لوحة الرسم */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addElement("text")}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-silver"
            >
              <Type size={14} /> نص ثابت
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-brand-royal/15 hover:bg-brand-royal/25 text-brand-royal-light">
                <Variable size={14} /> إضافة متغير
              </button>
              <div className="absolute top-full right-0 mt-1 w-40 glass-dark border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {Object.entries(VARIABLE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => addElement("variable", key)}
                    className="w-full text-right px-3 py-2 text-xs text-brand-silver hover:bg-white/5"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => addElement("divider")}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-silver"
            >
              <Minus size={14} /> خط فاصل
            </button>
          </div>

          <div
            ref={canvasRef}
            className="w-full rounded-2xl overflow-hidden relative select-none"
            style={{ aspectRatio: "1000/700" }}
            onMouseDown={() => setSelectedId(null)}
          >
            <CertificateRenderer
              elements={elements}
              backgroundColor={backgroundColor}
              variables={PREVIEW_VARS}
              sealImage={sealImage}
              width={1000}
              height={700}
              className="!w-full !h-full absolute inset-0"
            />
            {/* طبقة تفاعلية للسحب فوق العناصر */}
            {elements.map((el) => (
              <div
                key={el.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, el.id);
                }}
                className={`absolute cursor-move ${selectedId === el.id ? "ring-2 ring-brand-royal-light" : "hover:ring-1 hover:ring-white/30"}`}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  width: `${el.width}%`,
                  minHeight: el.type === "divider" ? 4 : 24,
                }}
              />
            ))}
          </div>
        </div>

        {/* لوحة الخصائص */}
        <div className="space-y-4">
          <div className="card-premium bg-brand-navy/60 glass-dark p-5 rounded-2xl border border-white/5 space-y-3">
            <label className="text-xs text-brand-silver-dim block">
              اسم القالب
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium w-full text-sm"
            />
            <label className="text-xs text-brand-silver-dim flex items-center gap-1.5">
              <Palette size={12} /> لون خلفية الشهادة
            </label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent"
            />
            <div className="pt-2 border-t border-white/5">
              <ImageUpload
                value={sealImage}
                onChange={setSealImage}
                label="ختم / طابع الشهادة"
              />
              <p className="text-xs text-brand-silver-dim mt-1 font-tajawal">يظهر في الزاوية السفلى اليسرى للشهادة</p>
            </div>
          </div>

          {selected ? (
            <div className="card-premium bg-brand-navy/60 glass-dark p-5 rounded-2xl border border-brand-royal/20 space-y-3">
              <p className="text-xs text-brand-royal-light font-bold">
                {selected.type === "variable"
                  ? VARIABLE_LABELS[selected.variable || ""]
                  : selected.type === "divider"
                    ? "خط فاصل"
                    : "نص ثابت"}
              </p>

              {selected.type === "text" && (
                <textarea
                  value={selected.content}
                  onChange={(e) => updateSelected({ content: e.target.value })}
                  rows={2}
                  className="input-premium w-full text-sm resize-none"
                />
              )}

              {selected.type !== "divider" && (
                <>
                  <div>
                    <label className="text-xs text-brand-silver-dim block mb-1">
                      حجم الخط: {selected.fontSize}px
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={selected.fontSize}
                      onChange={(e) =>
                        updateSelected({ fontSize: parseInt(e.target.value) })
                      }
                      className="w-full accent-brand-royal"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateSelected({
                          fontWeight:
                            selected.fontWeight === "bold" ? "normal" : "bold",
                        })
                      }
                      className={`p-2 rounded-lg ${selected.fontWeight === "bold" ? "bg-brand-royal/20 text-brand-royal-light" : "bg-white/5 text-brand-silver-dim"}`}
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => updateSelected({ textAlign: "right" })}
                      className={`p-2 rounded-lg ${selected.textAlign === "right" ? "bg-brand-royal/20 text-brand-royal-light" : "bg-white/5 text-brand-silver-dim"}`}
                    >
                      <AlignRight size={14} />
                    </button>
                    <button
                      onClick={() => updateSelected({ textAlign: "center" })}
                      className={`p-2 rounded-lg ${selected.textAlign === "center" ? "bg-brand-royal/20 text-brand-royal-light" : "bg-white/5 text-brand-silver-dim"}`}
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      onClick={() => updateSelected({ textAlign: "left" })}
                      className={`p-2 rounded-lg ${selected.textAlign === "left" ? "bg-brand-royal/20 text-brand-royal-light" : "bg-white/5 text-brand-silver-dim"}`}
                    >
                      <AlignLeft size={14} />
                    </button>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs text-brand-silver-dim block mb-1">
                  اللون
                </label>
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => updateSelected({ color: e.target.value })}
                  className="w-full h-9 rounded-lg cursor-pointer bg-transparent"
                />
              </div>

              <button
                onClick={removeSelected}
                className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={13} /> حذف العنصر
              </button>
            </div>
          ) : (
            <p className="text-xs text-brand-silver-dim px-2">
              اضغط على أي عنصر بالشهادة لتعديله، أو اسحبه لتغيير مكانه.
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full royal-gradient text-white font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
          {saving ? (
            <><Loader2 className="animate-spin" size={18} /> جارِ الحفظ...</>
          ) : saved ? (
            <><CheckCircle2 size={18} /> تم الحفظ ✓</>
          ) : (
            <><Save size={18} /> حفظ القالب</>
          )}
          </button>
        </div>
      </div>
    </div>
  );
}
