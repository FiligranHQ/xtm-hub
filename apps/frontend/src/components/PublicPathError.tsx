'use client';
import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { ErrorPage } from '@/components/ui/ErrorPage';
import { isProduction } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

interface PublicPathErrorProps {
  error: Error & { digest?: string; componentStack?: string };
  /**
   * Whether to report this error to the backend via `logFrontendError`.
   * Defaults to `true` for genuine unexpected errors (e.g. errors caught by
   * an `error.tsx` boundary). Callers that render this component for an
   * *expected* "not found" state (e.g. the root `not-found.tsx`, reached via
   * `notFound()` for an unknown/non-public slug) should pass `false` so a
   * normal 404 doesn't get reported as an application error.
   */
  shouldLog?: boolean;
}

const PublicPathError = ({
  error,
  shouldLog = true,
}: PublicPathErrorProps) => {
  const env = useRelayEnvironment();
  const t = useTranslations();
  useEffect(() => {
    if (shouldLog && isProduction()) {
      logFrontendError(
        env,
        error.message || 'Unknown error',
        error.stack || error.name,
        error.componentStack
      );
    }
  });

  return (
    <ErrorPage>
      <p className="text-center">{t('PublicPathError.NotFound')}</p>
    </ErrorPage>
  );
};

export default PublicPathError;
