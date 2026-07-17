import React from 'react';
import MessagesInbox from '@/components/admin/MessagesInbox';

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-white">رسائل التواصل</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">كل الرسائل المرسلة من صفحة "تواصل معنا"</p>
      </div>
      <MessagesInbox />
    </div>
  );
}
