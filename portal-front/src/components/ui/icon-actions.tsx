import { FunctionComponent, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';

interface IconActionsProps {
  children: ReactNode;
  icon: ReactNode;
}

export const IconActions: FunctionComponent<IconActionsProps> = ({
  children,
  icon,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};