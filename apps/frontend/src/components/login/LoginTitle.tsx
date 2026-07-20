'use client';
import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';
import { useTranslations } from 'next-intl';

const LoginTitleForm = ({}) => {
  const t = useTranslations();
  return (
    <>
      <LogoXTMDark />
      <h1 className="sr-only">{t('LoginPage.Title')}</h1>
    </>
  );
};

export default LoginTitleForm;
