'use client';

import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { isDevelopment } from '@/lib/utils';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}) {
  const environment = useRelayEnvironment();

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
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message ?? ''}</p>
      {isDevelopment() && <pre>{error.stack}</pre>}
    </div>
  );
}
