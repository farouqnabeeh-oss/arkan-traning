import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

// هذه الصفحة انضمت للوحة تحكم الأدمن الموحّدة تجنبًا للازدواجية.
// أي دخول قديم على /instructor يتحول تلقائيًا للوحة الجديدة.
export default async function InstructorRedirectPage() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
    redirect('/login?redirect=/dashboard/admin');
  }
  redirect('/dashboard/admin');
}
