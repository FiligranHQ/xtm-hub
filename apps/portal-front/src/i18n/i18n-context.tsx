import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

export default async function I18nContext({
  children,
}: {
  children: ReactNode;
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
