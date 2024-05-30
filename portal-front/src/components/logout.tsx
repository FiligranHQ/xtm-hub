'use client';

import { graphql, useMutation } from 'react-relay';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'filigran-ui/servers';
import { LogoutIcon } from 'filigran-icon';
import { cn } from '@/lib/utils';

// Relay
const LogoutMutation = graphql`
  mutation logoutMutation {
    logout
  }
`;

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
      className="w-full justify-start border-none">
      <LogoutIcon className="mr-2 h-4 w-4 flex-auto flex-shrink-0 flex-grow-0" />
      <span className={cn(open ? 'opacity-100' : 'opacity-0')}>Logout</span>
    </Button>
  );
};

// Component export
export default Logout;
