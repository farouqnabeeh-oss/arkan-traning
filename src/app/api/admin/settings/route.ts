import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

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
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة.' }, { status: 401 });
  }

  const rows = await db.siteSetting.findMany({
    where: { key: { in: ['bank_accounts', 'contact_info'] } },
  });

  const bankAccountsRow = rows.find((r) => r.key === 'bank_accounts');
  const contactInfoRow = rows.find((r) => r.key === 'contact_info');

  const bankAccounts = bankAccountsRow ? JSON.parse(bankAccountsRow.value) : DEFAULT_BANK_ACCOUNTS;
  const contactInfo = contactInfoRow ? JSON.parse(contactInfoRow.value) : DEFAULT_CONTACT_INFO;

  return NextResponse.json({ bankAccounts, contactInfo });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة.' }, { status: 401 });
  }

  const { bankAccounts, contactInfo } = await request.json();

  if (bankAccounts) {
    await db.siteSetting.upsert({
      where: { key: 'bank_accounts' },
      update: { value: JSON.stringify(bankAccounts) },
      create: { key: 'bank_accounts', value: JSON.stringify(bankAccounts) },
    });
  }

  if (contactInfo) {
    await db.siteSetting.upsert({
      where: { key: 'contact_info' },
      update: { value: JSON.stringify(contactInfo) },
      create: { key: 'contact_info', value: JSON.stringify(contactInfo) },
    });
  }

  return NextResponse.json({ success: true });
}
