import { FunctionComponent, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { Ellipsis } from 'lucide-react';

interface ThreeDotsActionsProps {
  children: ReactNode;
}
export const ThreeDotsActions: FunctionComponent<ThreeDotsActionsProps> = ({
  children,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <Ellipsis className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
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
