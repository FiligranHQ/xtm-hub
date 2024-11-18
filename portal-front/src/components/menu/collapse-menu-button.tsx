import { cn } from '@/lib/utils';
import { KeyboardArrowLeftIcon } from 'filigran-icon';
import { Separator } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';

interface CollapseMenuButtonProps {
  open: boolean;
  handleOpenMenu: () => void;
}

export const CollapseMenuButton: FunctionComponent<CollapseMenuButtonProps> = ({
  open,
  handleOpenMenu,
}) => {
  return (
    <div className="flex-shrink-0 pb-s">
      <Separator className="my-2" />
      <Button
        variant="ghost"
        className="h-9 w-full justify-start border-none"
        onClick={handleOpenMenu}>
        <span className="flex w-8 flex-shrink-0 justify-center">
          <KeyboardArrowLeftIcon
            className={cn(
              'h-4 w-4 p-1 duration-300 ease-in-out',
              open ? 'rotate-0' : 'rotate-180'
            )}
          />
        </span>
        <span className={cn('normal-case', open ? 'ml-2' : 'sr-only')}>
          Collapse
        </span>
      </Button>
    </div>
  );
};
