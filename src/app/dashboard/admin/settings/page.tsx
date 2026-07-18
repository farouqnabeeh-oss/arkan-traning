"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Landmark,
  Mail,
  Share2,
} from "lucide-react";

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

interface BankAccount {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
}

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
}

function createAccountId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `account-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setBankAccounts(data.bankAccounts || []);
        setSocialLinks(data.socialLinks || []);
        setContactInfo(
          data.contactInfo || {
            email: "",
            phone: "",
            whatsapp: "",
            address: "",
          },
        );
        setLoading(false);
      });
  }, []);

  function updateAccount(id: string, patch: Partial<BankAccount>) {
    setBankAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  }

  function addAccount() {
    setBankAccounts((prev) => [
      ...prev,
      { id: createAccountId(), label: "", value: "", isActive: true },
    ]);
  }

  function removeAccount(id: string) {
    setBankAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccounts, contactInfo, socialLinks }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-brand-silver-dim gap-2">
        <Loader2 className="animate-spin" size={20} /> جارِ التحميل...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-brand-white">
          الإعدادات العامة
        </h1>
        <p className="text-brand-silver-dim mt-1 text-sm">
          البيانات البنكية ومعلومات التواصل التي تظهر للطلاب في كل الموقع
        </p>
      </div>

      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
        <h2 className="font-bold text-brand-white mb-1 flex items-center gap-2">
          <Landmark size={18} className="text-brand-royal-light" /> وسائل الدفع
          / الحسابات البنكية
        </h2>
        <p className="text-xs text-brand-silver-dim mb-5">
          هذي هي الحسابات اللي بتظهر للطالب عند شراء دورة أو كتاب. عطّل أي حساب
          بدل ما تحذفه لو بدك تضيفه لاحقًا.
        </p>

        <div className="space-y-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brand-silver-dim block mb-1">
                    اسم الوسيلة
                  </label>
                  <input
                    value={acc.label}
                    onChange={(e) =>
                      updateAccount(acc.id, { label: e.target.value })
                    }
                    placeholder="مثال: جوال باي"
                    className="input-premium w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-silver-dim block mb-1">
                    الرقم / القيمة
                  </label>
                  <input
                    value={acc.value}
                    onChange={(e) =>
                      updateAccount(acc.id, { value: e.target.value })
                    }
                    placeholder="0567777296"
                    className="input-premium w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-brand-silver-dim cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acc.isActive}
                    onChange={(e) =>
                      updateAccount(acc.id, { isActive: e.target.checked })
                    }
                    className="accent-brand-royal"
                  />
                  ظاهر للطلاب الآن
                </label>
                <button
                  onClick={() => removeAccount(acc.id)}
                  className="text-red-400/70 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addAccount}
          className="mt-4 flex items-center gap-2 text-sm text-brand-royal-light hover:text-brand-royal transition-colors"
        >
          <Plus size={16} /> إضافة وسيلة دفع جديدة
        </button>
      </div>

      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
        <h2 className="font-bold text-brand-white mb-5 flex items-center gap-2">
          <Mail size={18} className="text-brand-royal-light" /> معلومات التواصل
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">
              البريد الإلكتروني
            </label>
            <input
              value={contactInfo.email}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, email: e.target.value })
              }
              className="input-premium w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">
              رقم الهاتف الظاهر
            </label>
            <input
              value={contactInfo.phone}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, phone: e.target.value })
              }
              className="input-premium w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">
              رقم واتساب (بدون +)
            </label>
            <input
              value={contactInfo.whatsapp}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, whatsapp: e.target.value })
              }
              className="input-premium w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-brand-silver-dim block mb-1">
              العنوان
            </label>
            <input
              value={contactInfo.address}
              onChange={(e) =>
                setContactInfo({ ...contactInfo, address: e.target.value })
              }
              className="input-premium w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
        <h2 className="font-bold text-brand-white mb-1 flex items-center gap-2">
          <Share2 size={18} className="text-brand-royal-light" /> روابط التواصل الاجتماعي
        </h2>
        <p className="text-xs text-brand-silver-dim mb-5">
          تظهر هذه الروابط في الفوتر. أضف أيقونة الشبكة كرابط صورة PNG/SVG شفاف (اختياري).
        </p>
        <div className="space-y-3">
          {socialLinks.map((link, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-brand-silver-dim block mb-1">اسم المنصة</label>
                  <input
                    value={link.label}
                    onChange={e => setSocialLinks(prev => prev.map((l, i) => i === idx ? { ...l, label: e.target.value } : l))}
                    placeholder="مثال: Instagram"
                    className="input-premium w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-silver-dim block mb-1">الرابط</label>
                  <input
                    value={link.url}
                    onChange={e => setSocialLinks(prev => prev.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))}
                    placeholder="https://instagram.com/..."
                    className="input-premium w-full text-sm font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-silver-dim block mb-1">رابط الأيقونة (PNG/SVG)</label>
                  <input
                    value={link.icon}
                    onChange={e => setSocialLinks(prev => prev.map((l, i) => i === idx ? { ...l, icon: e.target.value } : l))}
                    placeholder="https://...icon.svg"
                    className="input-premium w-full text-sm font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                {link.icon && <img src={link.icon} alt={link.label} className="w-6 h-6 object-contain opacity-70" />}
                <div className="flex-1" />
                <button
                  onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-400/70 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSocialLinks(prev => [...prev, { label: '', url: '', icon: '' }])}
          className="mt-4 flex items-center gap-2 text-sm text-brand-royal-light hover:text-brand-royal transition-colors"
        >
          <Plus size={16} /> إضافة منصة جديدة
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="royal-gradient text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="animate-spin" size={18} />
        ) : saved ? (
          <CheckCircle2 size={18} />
        ) : (
          <Save size={18} />
        )}
        {saving ? "جارِ الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
      </button>
    </div>
  );
}
