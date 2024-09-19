'use client';

import {useMutation} from 'react-relay';
import * as React from 'react';
import {useRouter} from 'next/navigation';
import {Button} from 'filigran-ui/servers';
import {LogoutIcon} from 'filigran-icon';
import {LogoutMutation} from '@/components/logout.graphql';

// Component interface
interface LogoutProps {}

// Component
const Logout: React.FunctionComponent<LogoutProps> = ({}) => {
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
      <LogoutIcon className="mr-s h-4 w-4" /> Logout
    </Button>
  );
};

// Component export
export default Logout;
