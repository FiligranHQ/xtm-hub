import Link from 'next/link';

const LoginMessage = () => {
  return (
    <div className="bg-page-background border border-border-light rounded w-full p-xl text-sm text-center">
      To login, please{' '}
      <Link
        className="text-primary"
        href="https://filigran.io/xtm-hub-sign-up/">
        create your account
      </Link>{' '}
      on the Filigran website
    </div>
  );
};

export default LoginMessage;
