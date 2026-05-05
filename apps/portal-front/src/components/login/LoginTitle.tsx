'use client';
import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { useTranslations } from 'next-intl';

const LoginTitleForm = ({}) => {
  const t = useTranslations();
  return (
    <>
      <DisplayLogo />
      <h1 className="sr-only">{t('LoginPage.Title')}</h1>
    </>
  );
};

export default LoginTitleForm;
