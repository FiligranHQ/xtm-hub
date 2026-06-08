import { isValueInEnum } from '@/utils/is-value-in-enum';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import {
  DocumentOrdering,
  OrderingMode,
} from '@generated/documentsQuery.graphql';
import { DocumentOrderingEnum } from '@generated/models/DocumentOrdering.enum';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect } from 'react';
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
    useLocalStorage<DocumentOrdering>(
      'orderByDocumentList',
      DocumentOrderingEnum.CREATED_AT as DocumentOrdering
    );

  useEffect(() => {
    if (!isValueInEnum(orderBy, DocumentOrderingEnum)) {
      setOrderBy(DocumentOrderingEnum.CREATED_AT as DocumentOrdering);
    }
  }, [orderBy, setOrderBy]);
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
