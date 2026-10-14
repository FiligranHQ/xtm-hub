import { useTranslate } from '@/hooks/use-translate';
import Link from 'next/link';

const LoginMessage = () => {
  const t = useTranslate();

  return (
    <div className="layer-1 bg-elevation-default border border-elevation-subtle rounded w-full p-6 text-sm text-center">
      {t('LoginPage.DontHaveAccount')}{' '}
      <Link
        className="text-filigran-brand-primary"
        href="/sign-up">
        {t('LoginPage.SignUp')}
      </Link>
    </div>
  );
};

export default LoginMessage;
