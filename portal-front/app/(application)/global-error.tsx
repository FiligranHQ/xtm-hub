'use client';

import { logFrontendError } from '@/components/error-frontend-log.graphql';
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
        <h2>Something went wrong!</h2>
        <p>{error.message ?? ''}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
