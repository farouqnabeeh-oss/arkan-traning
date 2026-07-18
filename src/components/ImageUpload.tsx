'use client';

import React, { useRef, useState } from 'react';
import { Upload, Link2, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'صورة الغلاف' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error('استجابة غير متوقعة من الخادم. حاول مرة أخرى.');
      }
      if (!res.ok) throw new Error(data.error || 'فشل الرفع');
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الصورة.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-brand-silver">{label}</label>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-tajawal transition-all ${
              mode === 'upload' ? 'bg-brand-royal/30 text-brand-royal-light' : 'text-brand-silver hover:text-white'
            }`}
          >
            <Upload size={12} /> رفع صورة
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-tajawal transition-all ${
              mode === 'url' ? 'bg-brand-royal/30 text-brand-royal-light' : 'text-brand-silver hover:text-white'
            }`}
          >
            <Link2 size={12} /> رابط URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
            uploading ? 'border-brand-royal/50 bg-brand-royal/5' : 'border-white/10 hover:border-brand-royal/50 hover:bg-brand-royal/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />

          {value && !uploading ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="صورة الغلاف"
                className="w-full h-40 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <p className="text-white text-sm font-tajawal flex items-center gap-2">
                  <Upload size={16} /> تغيير الصورة
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="absolute top-2 left-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              {uploading ? (
                <>
                  <Loader2 size={28} className="text-brand-royal-light animate-spin" />
                  <p className="text-sm text-brand-silver font-tajawal">جارِ الرفع...</p>
                </>
              ) : (
                <>
                  <ImageIcon size={28} className="text-brand-silver/50 group-hover:text-brand-royal-light transition-colors" />
                  <div className="text-center">
                    <p className="text-sm text-brand-silver font-tajawal">اضغط لاختيار صورة</p>
                    <p className="text-xs text-brand-silver-dim font-tajawal mt-1">JPG, PNG, WEBP — حتى 5MB</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="input-premium w-full font-mono text-sm"
            dir="ltr"
          />
          {value && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="معاينة" className="w-full h-32 object-contain bg-black/40 rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 font-tajawal">{error}</p>
      )}
    </div>
  );
}
