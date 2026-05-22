import { PaginationArrowButtons } from '@/components/ui/pagination/PaginationArrowButtons';
import { PaginationManageDropdown } from '@/components/ui/pagination/PaginationManageDropdown';
import { PaginationState } from '@tanstack/react-table';

interface PaginationControlsProps {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  onPaginationChange: (state: PaginationState) => void;
  onSetPageSize: (pageSize: number) => void;
}

export const PaginationControls = ({
  pageSize,
  totalCount,
  onPaginationChange,
  pageIndex,
  onSetPageSize,
}: PaginationControlsProps) => {
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
