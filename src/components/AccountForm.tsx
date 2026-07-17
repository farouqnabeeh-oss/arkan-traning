'use client';

import React, { useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function AccountForm({ initial }: { initial: { name: string; email: string; phone: string } }) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    setSaving(true);
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, phone,
        ...(newPassword && { currentPassword, newPassword }),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'حدث خطأ أثناء الحفظ.');
      return;
    }
    setSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl font-tajawal">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-brand-white/60 font-tajawal block mb-1.5">الاسم الكامل</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-premium w-full font-tajawal" data-gramm="false" data-gramm_editor="false" />
        </div>
        <div>
          <label className="text-sm text-brand-white/60 font-tajawal block mb-1.5">البريد الإلكتروني</label>
          <input value={initial.email} disabled className="input-premium w-full font-tajawal opacity-50 cursor-not-allowed" dir="ltr" data-gramm="false" />
        </div>
        <div>
          <label className="text-sm text-brand-white/60 font-tajawal block mb-1.5">رقم الهاتف</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-premium w-full font-tajawal" dir="ltr" data-gramm="false" data-gramm_editor="false" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4">
        <h3 className="text-sm font-tajawal font-bold text-brand-white flex items-center gap-2">
          <KeyRound size={15} className="text-brand-royal-light" /> تغيير كلمة المرور (اختياري)
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="كلمة المرور الحالية"
            className="input-premium w-full font-tajawal"
            data-gramm="false"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            className="input-premium w-full font-tajawal"
            data-gramm="false"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="royal-gradient text-white font-tajawal font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? (
          <><Loader2 className="animate-spin" size={18} /> جارِ الحفظ...</>
        ) : saved ? (
          <><CheckCircle2 size={18} /> تم الحفظ ✓</>
        ) : (
          <><Save size={18} /> حفظ التغييرات</>
        )}
      </button>
    </div>
  );
}
