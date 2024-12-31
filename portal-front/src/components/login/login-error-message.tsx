import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode } from 'react';

interface ErrorMessageProps {
  errorKey: string;
}

const LoginErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  errorKey,
}) => {
  const t = useTranslations();
  const errorMap: Record<string, ReactNode> = {
    'not-provided': (
      <>
        <h1 className="pt-l txt-title text-center text-red">
          {t('LoginPage.Errors.AccountNotProvidedTitle')}
        </h1>
        <p className="txt-subtitle text-center text-red">
          {t('LoginPage.Errors.AccountNotProvided')}
        </p>
      </>
    ),
  };
  return <>{errorMap[errorKey]}</>;
};

export default LoginErrorMessage;
