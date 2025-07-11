import { cn } from '@/lib/utils';
import { KeyboardArrowLeftIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

interface CollapseMenuButtonProps {
  open: boolean;
  handleOpenMenu: () => void;
}

export const CollapseMenuButton: FunctionComponent<CollapseMenuButtonProps> = ({
  open,
  handleOpenMenu,
}) => {
  const t = useTranslations();
  return (
    <div className="flex-shrink-0 pb-s">
      <Button
        variant="ghost"
        aria-label={t('App.CollapseSidebar')}
        className="h-9 px-m w-full justify-start rounded-none"
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
          {t('App.Collapse')}
        </span>
      </Button>
    </div>
  );
};
