'use client';

import { LogoutMutation } from '@/components/logout.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useMutation } from 'react-relay';

// Component interface
interface LogoutProps {
  className?: string;
}

// Component
const Logout: React.FunctionComponent<LogoutProps> = ({ className }) => {
  const router = useRouter();
  const [commitLogoutMutation] = useMutation(LogoutMutation);
  const t = useTranslations();

  const logout = () => {
    commitLogoutMutation({
      variables: {},
      updater: (store) => {
        store.invalidateStore();
      },
      onCompleted() {
        router.push('/');
        router.refresh();
      },
    });
  };
  return (
    <Button
      onClick={logout}
      variant="ghost"
      className={className}>
      {t('LoginPage.Logout')}
    </Button>
  );
};

// Component export
export default Logout;
