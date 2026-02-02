import { TableTuneIcon } from '@filigran/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  pageSize: number;
  onSetPageSize: (pageSize: number) => void;
}

export const PaginationManageDropdown: React.FC<Props> = ({
  onSetPageSize,
  pageSize,
}) => {
  const t = useTranslations();
  const dropdownItems = useMemo(() => {
    return [50, 100, 200, 300, 500].map((pageSize) => (
      <DropdownMenuRadioItem
        value={String(pageSize)}
        key={pageSize}>
        {pageSize}
      </DropdownMenuRadioItem>
    ));
  }, [pageSize]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none"
          aria-label={t('GenericActions.Paginate.Manage')}>
          <TableTuneIcon className="h-[1.125rem] w-[1.125rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('GenericActions.Paginate.RowsPerPage')}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(pageSize) => onSetPageSize(Number(pageSize))}>
                {dropdownItems}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
