'use client';

import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { isDevelopment } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}) {
  const environment = useRelayEnvironment();
  const t = useTranslations();

  if (!isDevelopment())
    useEffect(() => {
      if (error) {
        logFrontendError(
          environment,
          error.message || 'Unknown error',
          error.stack,
          error.componentStack
        );
      }
    }, [error, environment]);

  return (
    <html>
      <body>
        <h2>{t('Error.SomethingWentWrong')}</h2>
        <p>
          {error.message
            ? t(`Error.Server.${error.message}`)
            : t('Error.AnErrorOccured')}
        </p>
        {isDevelopment() && <pre>{error.stack}</pre>}
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
