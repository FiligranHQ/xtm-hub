import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import {
  DocumentOrdering,
  OrderingMode,
} from '@generated/documentsQuery.graphql';
import { ColumnDef } from '@tanstack/react-table';
import { useLocalStorage } from 'usehooks-ts';

export const documentListLocalStorage = (
  columns: ColumnDef<documentItem_fragment$data>[]
) => {
  const [count, setCount, removeCount] = useLocalStorage(
    'countDocumentList',
    50
  );
  const [orderMode, setOrderMode, removeOrderMode] =
    useLocalStorage<OrderingMode>('orderModeDocumentList', 'desc');
  const [orderBy, setOrderBy, removeOrderBy] =
    useLocalStorage<DocumentOrdering>('orderByDocumentList', 'created_at');
  const [pageSize, setPageSize, removePageSize] = useLocalStorage(
    'countDocumentList',
    50
  );
  const [columnOrder, setColumnOrder, removeColumnOrder] = useLocalStorage(
    'columnOrderingDocumentList',
    columns.map((c) => c.id!)
  );

  const [columnVisibility, setColumnVisibility, removeColumnVisibility] =
    useLocalStorage('columnVisibilityDocumentList', {});

  const resetAll = () => {
    removeCount();
    removeOrderMode();
    removeOrderBy();
    removePageSize();
    removeColumnOrder();
    removeColumnVisibility();
  };

  return {
    count,
    setCount,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    pageSize,
    setPageSize,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  };
};
