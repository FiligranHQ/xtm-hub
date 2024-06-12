import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui/servers';
import * as React from 'react';
import { Pagination } from 'react-headless-pagination';
import { FunctionComponent } from 'react';

interface PaginationProps {
  page: number;
  handlePageChange: (page: number) => void;
  totalPages: number;
}
const GenericPagination: FunctionComponent<PaginationProps> = ({
  page,
  handlePageChange,
  totalPages,
}) => {
  return (
    <Pagination
      currentPage={page}
      setCurrentPage={handlePageChange}
      className="flex h-10  select-none items-center justify-end"
      truncableText="..."
      truncableClassName="w-10 px-0.5 text-center"
      edgePageCount={2}
      totalPages={totalPages}
      middlePagesSiblingCount={1}>
      <div className="px-2">
        Page {page + 1} of {totalPages}
      </div>
      <Pagination.PrevButton
        disabled={page === 0}
        className={cn(
          buttonVariants({
            variant: 'ghost',
          })
        )}>
        {'< '} Previous
      </Pagination.PrevButton>

      <nav className="flex">
        <ul className="flex items-center">
          <Pagination.PageButton
            activeClassName="bg-primary-50 dark:bg-opacity-0 text-primary-600 dark:text-white"
            inactiveClassName="text-gray-500"
            className={
              'hover:text-primary-600 focus:text-primary-600 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full focus:font-bold focus:outline-none'
            }
          />
        </ul>
      </nav>

      <Pagination.NextButton
        disabled={page === totalPages - 1}
        className={cn(
          buttonVariants({
            variant: 'ghost',
          })
        )}>
        Next {' >'}
      </Pagination.NextButton>
    </Pagination>
  );
};

export default GenericPagination;
