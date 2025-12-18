import { ArrowNextIcon, ArrowPreviousIcon } from '@filigran/icon';
import { Button } from '@filigran/ui/servers';
import { PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (state: PaginationState) => void;
}

export const PaginationArrowButtons: React.FC<Props> = ({
  onPaginationChange,
  totalCount,
  pageIndex,
  pageSize,
}) => {
  const t = useTranslations();
  const pageCount = Math.ceil(totalCount / pageSize);

  const canGoToPreviousPage = (): boolean => {
    return pageIndex > 0;
  };

  const canGoToNextPage = (): boolean => {
    return pageIndex < pageCount - 1;
  };

  const previousPage = (): void => {
    if (!canGoToPreviousPage()) {
      return;
    }

    onPaginationChange({ pageSize, pageIndex: pageIndex - 1 });
  };

  const nextPage = (): void => {
    if (!canGoToNextPage()) {
      return;
    }

    onPaginationChange({ pageSize, pageIndex: pageIndex + 1 });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none"
        onClick={() => previousPage()}
        disabled={!canGoToPreviousPage()}
        aria-label={t('GenericActions.Paginate.PreviousPage')}>
        <ArrowPreviousIcon className="size-3" />
      </Button>
      <div className="px-s leading-none text-text-secondary txt-sub-content">
        <span className="text-foreground">
          {totalCount > 0 ? pageIndex * pageSize + 1 : 0}
          {' - '}
          {Math.min((pageIndex + 1) * pageSize, totalCount)}
        </span>
        / {totalCount}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none"
        onClick={() => nextPage()}
        disabled={!canGoToNextPage()}
        aria-label={t('GenericActions.Paginate.NextPage')}>
        <ArrowNextIcon className="size-3" />
      </Button>
    </>
  );
};
