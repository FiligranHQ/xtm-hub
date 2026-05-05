import type { Locale } from '@/i18n/config';
import { redirect } from 'next/navigation';

const Page = async ({ params }: { params: Promise<{ locale: Locale }> }) => {
  const { locale } = await params;
  redirect(`/${locale}`);
};

export default Page;
