import { publicLocales, type PublicLocale } from '@/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as React from 'react';

export function generateStaticParams() {
  return publicLocales.map((locale) => ({ locale }));
}

const LocaleLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  if (!publicLocales.includes(locale as PublicLocale)) {
    notFound();
  }
  setRequestLocale(locale);
  return <>{children}</>;
};

export default LocaleLayout;
