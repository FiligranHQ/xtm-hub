'use client';
import {
  type Cell,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Header,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'filigran-ui';
import {
  forwardRef,
  ReactNode,
  Ref,
  RefAttributes,
  useImperativeHandle,
  useState,
} from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { type Transform } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from 'filigran-ui';
import { ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableOptions } from '@tanstack/table-core';

export function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: Ref<T>) => ReactNode
): (props: P & RefAttributes<T>) => ReactNode {
  return forwardRef(render) as any;
}

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableState?: Partial<TableState>;
  tableOptions?: Partial<TableOptions<TData>>;
}

function getTransformString({ x, y }: Transform) {
  return `translate(${x}px, ${y}px)`;
}

const DraggableTableHeader = ({ header }: { header: Header<any, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  return (
    <TableHead
      key={header.id}
      colSpan={header.colSpan}
      className={cn(
        'transition-width group relative z-0 whitespace-nowrap opacity-100 transition-transform duration-200 ease-in-out',
        isDragging && 'z-10 opacity-80'
      )}
      ref={setNodeRef}
      style={{
        width: header.getSize(),
        transform: transform ? getTransformString(transform) : undefined,
      }}>
      <div className=" flex items-center">
        {header.isPlaceholder ? null : (
          <div
            className={cn(
              'flex items-center gap-2',
              header.column.getCanSort() && 'cursor-pointer select-none'
            )}
            onClick={header.column.getToggleSortingHandler()}
            title={
              header.column.getCanSort()
                ? header.column.getNextSortingOrder() === 'asc'
                  ? 'Sort ascending'
                  : header.column.getNextSortingOrder() === 'desc'
                    ? 'Sort descending'
                    : 'Clear sort'
                : undefined
            }>
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: <ChevronUp className="h-4 w-4" />,
              desc: <ChevronDown className="h-4 w-4" />,
            }[header.column.getIsSorted() as string] ?? null}
          </div>
        )}
        <button
          className={cn('opacity-0 group-hover:opacity-100')}
          {...attributes}
          {...listeners}>
          <GripHorizontal className="ml-1 h-6 w-6" />
        </button>
      </div>
      <div
        onDoubleClick={() => header.column.resetSize()}
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={cn(
          `absolute right-0 top-0 h-full w-1 cursor-col-resize select-none 
                     bg-gray-700 opacity-0
                     `,
          header.column.getIsResizing() && `bg-primary opacity-100`,
          !isDragging && 'group-hover:opacity-100'
        )}
      />
    </TableHead>
  );
};

const DragAlongCell = ({ cell }: { cell: Cell<any, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });
  return (
    <TableCell
      key={cell.id}
      ref={setNodeRef}
      style={{
        width: cell.column.getSize(),
        transform: transform ? getTransformString(transform) : undefined,
      }}
      className={cn(
        'transition-width group relative z-0 opacity-100 transition-transform duration-200 ease-in-out',
        isDragging && 'z-10 opacity-80'
      )}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

function GenericDataTable<TData extends { id: string }, TValue>(
  { columns, data, tableState, tableOptions }: DataTableProps<TData, TValue>,
  ref?: any
) {
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    onColumnOrderChange: setColumnOrder,
    getRowId: (c) => c.id,
    state: {
      columnOrder,
      ...tableState,
    },
    ...tableOptions,
  });

  useImperativeHandle(ref, () => table);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded border border-black">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}>
        <div className="rounded-md">
          <Table style={{ width: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <SortableContext
                      key={cell.id}
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}>
                      <DragAlongCell
                        key={cell.id}
                        cell={cell}
                      />
                    </SortableContext>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DndContext>
    </>
  );
}

export const DataTable = fixedForwardRef(GenericDataTable);
