'use client';

import { useMutation } from 'react-relay';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'filigran-ui/servers';
import { LogoutIcon } from 'filigran-icon';
import { cn } from '@/lib/utils';
import { LogoutMutation } from '@/components/logout.graphql';

// Component interface
interface LogoutProps {
  open: boolean;
}

// Component
const Logout: React.FunctionComponent<LogoutProps> = ({ open }) => {
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
      className="h-9 w-full justify-start border-none">
      <span className="flex w-8 flex-shrink-0 justify-center">
        <LogoutIcon className="h-4 w-4" />
      </span>
      <span className={cn(open ? 'ml-2' : 'sr-only')}>Logout</span>
    </Button>
  );
};

// Component export
export default Logout;
