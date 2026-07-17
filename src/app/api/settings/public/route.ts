import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_BANK_ACCOUNTS = [
  { id: 'jawwal-pay', label: 'جوال باي', value: '0567777296', isActive: true },
  { id: 'bank-of-palestine', label: 'بال باي', value: '0567777296', isActive: true },
  { id: 'islami-bank', label: 'البنك الإسلامي الفلسطيني', value: 'سيتم إضافته لاحقًا', isActive: false },
];

const DEFAULT_CONTACT_INFO = {
  email: 'farugn9@gmail.com',
  phone: '+970 567 777 296',
  whatsapp: '970567777296',
  address: 'فلسطين',
};

export async function GET() {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: ['bank_accounts', 'contact_info'] } },
    });

    const bankAccountsRow = rows.find((r) => r.key === 'bank_accounts');
    const contactInfoRow = rows.find((r) => r.key === 'contact_info');

    const bankAccounts = bankAccountsRow ? JSON.parse(bankAccountsRow.value) : DEFAULT_BANK_ACCOUNTS;
    const contactInfo = contactInfoRow ? JSON.parse(contactInfoRow.value) : DEFAULT_CONTACT_INFO;

    return NextResponse.json({
      bankAccounts: bankAccounts.filter((a: any) => a.isActive),
      contactInfo,
    });
  } catch {
    return NextResponse.json({ bankAccounts: DEFAULT_BANK_ACCOUNTS.filter(a => a.isActive), contactInfo: DEFAULT_CONTACT_INFO });
  }
}
