'use client';
import LoginErrorMessage from '@/components/login/login-error-message';
import { DisplayLogo } from '@/components/ui/display-logo';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FunctionComponent } from 'react';

const LoginTitleForm: FunctionComponent = ({}) => {
  const searchParams = useSearchParams();
  const errorKey = searchParams?.get('error');
  const t = useTranslations();
  return (
    <>
      <DisplayLogo />
      {errorKey ? (
        <LoginErrorMessage errorKey={errorKey} />
      ) : (
        <>
          <h1 className="sr-only">{t('LoginPage.Title')}</h1>
        </>
      )}
    </>
  );
};

export default LoginTitleForm;
