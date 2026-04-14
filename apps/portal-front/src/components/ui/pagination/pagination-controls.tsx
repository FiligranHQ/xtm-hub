import { PaginationArrowButtons } from '@/components/ui/pagination/pagination-arrow-buttons';
import { PaginationManageDropdown } from '@/components/ui/pagination/pagination-manage-dropdown';
import { PaginationState } from '@tanstack/react-table';
import React from 'react';

interface Props {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  onPaginationChange: (state: PaginationState) => void;
  onSetPageSize: (pageSize: number) => void;
}

export const PaginationControls: React.FC<Props> = ({
  pageSize,
  totalCount,
  onPaginationChange,
  pageIndex,
  onSetPageSize,
}) => {
  if (totalCount <= pageSize) {
    return null;
  }

  return (
    <div className="flex-0 shrink-0 box-border flex h-9 items-center rounded border border-border-light">
      <PaginationArrowButtons
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={onPaginationChange}
      />
      <PaginationManageDropdown
        pageSize={pageSize}
        onSetPageSize={onSetPageSize}
      />
    </div>
  );
};
