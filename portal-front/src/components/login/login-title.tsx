import LoginErrorMessage from '@/components/login/login-error-message';
import { useSearchParams } from 'next/navigation';
import { FunctionComponent } from 'react';

interface LoginTitleProps {}

const LoginTitleForm: FunctionComponent<LoginTitleProps> = ({}) => {
  const searchParams = useSearchParams();
  const errorKey = searchParams?.get('error');

  return (
    <>
      {errorKey ? (
        <LoginErrorMessage errorKey={errorKey} />
      ) : (
        <h1 className="pt-l pb-s txt-title">- Sign in -</h1>
      )}
    </>
  );
};

export default LoginTitleForm;
