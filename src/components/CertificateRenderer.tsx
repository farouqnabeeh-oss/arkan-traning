'use client';

import React from 'react';

export interface CertElement {
  id: string;
  type: 'text' | 'variable' | 'divider' | 'image';
  content?: string;      // للنص الثابت
  variable?: string;     // STUDENT_NAME | COURSE_TITLE | DATE | VERIFICATION_ID
  imageUrl?: string;     // للصور مثل الشعارات والأختام المرفوعة
  x: number;              // % من عرض الشهادة
  y: number;              // % من ارتفاع الشهادة
  width: number;          // % من عرض الشهادة
  height?: number;        // % من ارتفاع الشهادة (اختياري)
  fontSize: number;       // px
  color: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'right' | 'center' | 'left';
}

export interface CertVariables {
  STUDENT_NAME: string;
  COURSE_TITLE: string;
  DATE: string;
  VERIFICATION_ID: string;
}

export const VARIABLE_LABELS: Record<string, string> = {
  STUDENT_NAME: 'اسم الطالب',
  COURSE_TITLE: 'اسم الدورة',
  DATE: 'التاريخ',
  VERIFICATION_ID: 'رقم التحقق',
};

export function resolveElementText(el: CertElement, vars: CertVariables): string {
  if (el.type === 'variable') return vars[(el.variable as keyof CertVariables) || 'STUDENT_NAME'] || '';
  return el.content || '';
}

export default function CertificateRenderer({
  elements, backgroundColor, variables, width = 1000, height = 700, className = '', sealImage,
}: {
  elements: CertElement[]; backgroundColor: string; variables: CertVariables;
  width?: number; height?: number; className?: string; sealImage?: string | null;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}
      style={{ width, height, background: backgroundColor, aspectRatio: `${width}/${height}` }}
    >
      {/* إطار زخرفي بهوية أركان */}
      <div className="absolute inset-4 border-2 rounded-xl pointer-events-none" style={{ borderColor: 'rgba(124,147,240,0.4)' }} />
      <div className="absolute inset-6 border pointer-events-none" style={{ borderColor: 'rgba(199,208,222,0.2)' }} />

      {/* شعار أركان الافتراضي في الترويسة - نتركه أو نلغيه إذا أضاف الطالب شعاره الخاص، لكن نجعله كخلفية افتراضية */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center pt-6 pb-3 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpeg"
          alt="أركان"
          style={{ height: 48, objectFit: 'contain', opacity: 0.9 }}
        />
      </div>

      {/* الختم القديم (للتوافق الرجعي فقط إذا كان موجودًا) */}
      {sealImage && (
        <div className="absolute bottom-8 left-10 pointer-events-none" style={{ width: 90, height: 90 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sealImage}
            alt="ختم"
            style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.85 }}
          />
        </div>
      )}

      {elements.map((el) => {
        if (el.type === 'divider') {
          return (
            <div
              key={el.id}
              className="absolute h-[2px]"
              style={{
                left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`,
                background: `linear-gradient(90deg, transparent, ${el.color}, transparent)`,
              }}
            />
          );
        }
        if (el.type === 'image') {
          return (
            <div
              key={el.id}
              className="absolute pointer-events-none"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: el.height ? `${el.height}%` : 'auto',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {el.imageUrl ? (
                <img
                  src={el.imageUrl}
                  alt="عنصر الشهادة"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div className="w-full h-12 bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-xs text-brand-silver">
                  صورة فارغة
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            key={el.id}
            className="absolute font-tajawal"
            style={{
              left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`,
              fontSize: el.fontSize, color: el.color, fontWeight: el.fontWeight === 'bold' ? 800 : 400,
              textAlign: el.textAlign, transform: 'translate(0, 0)',
            }}
          >
            {resolveElementText(el, variables)}
          </div>
        );
      })}
    </div>
  );
}
