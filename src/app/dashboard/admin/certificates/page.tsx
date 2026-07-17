import React from 'react';
import CertificateTemplateBuilder from '@/components/admin/CertificateTemplateBuilder';

export default function DefaultCertificatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-white">القالب الافتراضي للشهادات</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">هذا القالب يُستخدم لأي دورة ما إلها قالب خاص بها. صمّمه بالسحب والإفلات.</p>
      </div>
      <CertificateTemplateBuilder
        fetchUrl="/api/admin/certificate-template/default"
        saveUrl="/api/admin/certificate-template/default"
        title="القالب الافتراضي"
      />
    </div>
  );
}
