import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface LoginMessageProps {
  isHomePageV2Enabled: boolean;
}

const LoginMessage = ({ isHomePageV2Enabled }: LoginMessageProps) => {
  const t = useTranslations();

  return (
    <div className="bg-page-background border border-border-light rounded w-full p-xl text-sm text-center">
      {t('LoginPage.DontHaveAccount')}{' '}
      <Link
        className="text-primary"
        href={
          isHomePageV2Enabled
            ? '/sign-up'
            : 'https://filigran.io/filigran-account-creation/?form_origin=xtmhub'
        }>
        {t('LoginPage.SignUp')}
      </Link>
    </div>
  );
};

export default LoginMessage;
