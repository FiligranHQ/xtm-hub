import { PaginationState } from '@tanstack/react-table';
import React from 'react';
import { PaginationArrowButtons } from '@/components/ui/pagination/PaginationArrowButtons';
import { PaginationManageDropdown } from '@/components/ui/pagination/PaginationManageDropdown';

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
