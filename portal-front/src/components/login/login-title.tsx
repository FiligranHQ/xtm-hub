'use client';
import LoginErrorMessage from '@/components/login/login-error-message';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { FunctionComponent } from 'react';
import LogoXTMDark from '../../../public/logo_xtm_hub_dark.svg';
import LogoXTMLight from '../../../public/logo_xtm_hub_light.svg';

interface LoginTitleProps {}

const LoginTitleForm: FunctionComponent<LoginTitleProps> = ({}) => {
  const searchParams = useSearchParams();
  const errorKey = searchParams?.get('error');
  const t = useTranslations();
  return (
    <>
      {errorKey ? (
        <LoginErrorMessage errorKey={errorKey} />
      ) : (
        <>
          <DisplayLogo />
          <h1 className="sr-only">{t('LoginPage.Title')}</h1>
        </>
      )}
    </>
  );
};

const DisplayLogo = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? <LogoXTMDark /> : <LogoXTMLight />;
};

export default LoginTitleForm;
