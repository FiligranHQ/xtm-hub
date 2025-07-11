import { useTranslations } from 'next-intl';
import Link from 'next/link';

const LoginMessage = () => {
  const t = useTranslations();
  return (
    <div className="bg-page-background border border-border-light rounded w-full p-xl text-sm text-center">
      {t('LoginPage.ToLoginPlease')}{' '}
      <Link
        className="text-primary"
        href="https://filigran.io/filigran-account-creation/">
        {t('LoginPage.CreateYourAccount')}
      </Link>{' '}
      {t('LoginPage.OnFiligranWebsite')}
    </div>
  );
};

export default LoginMessage;
