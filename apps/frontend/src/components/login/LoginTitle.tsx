'use client';
import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';

import { useTranslate } from '@tolgee/react';
const LoginTitleForm = ({}) => {
  const { t } = useTranslate();
  return (
    <>
      <LogoXTMDark />
      <h1 className="sr-only">{t('LoginPage_Title')}</h1>
    </>
  );
};

export default LoginTitleForm;
