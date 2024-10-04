'use client';

import { LogoutMutation } from '@/components/logout.graphql';
import { LogoutIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
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
  const logout = () => {
    commitLogoutMutation({
      variables: {},
      onCompleted() {
        router.refresh();
      },
    });
  };
  return (
    <Button
      onClick={logout}
      variant="ghost"
      className={className}>
      <LogoutIcon className="mr-s h-4 w-4" /> Logout
    </Button>
  );
};

// Component export
export default Logout;
