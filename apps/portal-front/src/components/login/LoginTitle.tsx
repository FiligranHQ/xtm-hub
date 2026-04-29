'use client';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { DisplayLogo } from '@/components/ui/DisplayLogo';

const LoginTitleForm: FunctionComponent = ({}) => {
  const t = useTranslations();
  return (
    <>
      <DisplayLogo />
      <h1 className="sr-only">{t('LoginPage.Title')}</h1>
    </>
  );
};

export default LoginTitleForm;
