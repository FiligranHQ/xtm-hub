'use client';
import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { ErrorPage } from '@/components/ui/ErrorPage';
import { isProduction } from '@/lib/utils';
import { useEffect } from 'react';
import { useRelayEnvironment } from 'react-relay';

import { useTranslate } from '@tolgee/react';
interface PublicPathErrorProps {
  error: Error & { digest?: string; componentStack?: string };
}

const PublicPathError = ({ error }: PublicPathErrorProps) => {
  const env = useRelayEnvironment();
  const { t } = useTranslate();
  useEffect(() => {
    if (isProduction()) {
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
      <p className="text-center">{t('PublicPathError_NotFound')}</p>
    </ErrorPage>
  );
};

export default PublicPathError;
