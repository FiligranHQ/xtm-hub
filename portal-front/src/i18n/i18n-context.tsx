import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { getUserLocale } from '@/i18n/locale';

export default async function I18nContext({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getUserLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
