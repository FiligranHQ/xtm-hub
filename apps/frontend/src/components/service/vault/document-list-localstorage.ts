import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { OrderingMode } from '@generated/documentsQuery.graphql';
import { DocumentOrderingEnum } from '@generated/models/DocumentOrdering.enum';
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
    useLocalStorage<DocumentOrderingEnum>(
      'orderByDocumentList',
      DocumentOrderingEnum.CREATED_AT
    );
  const documentOrderingValues = Object.values(DocumentOrderingEnum);
  if (!documentOrderingValues.includes(orderBy)) {
    setOrderBy(DocumentOrderingEnum.CREATED_AT);
  }
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

  const removeOrder = () => {
    removeOrderBy();
    removeOrderMode();
  };

  return {
    count,
    setCount,
    orderMode,
    setOrderMode,
    orderBy,
    setOrderBy,
    removeOrder,
    pageSize,
    setPageSize,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    resetAll,
  };
};
