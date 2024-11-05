import {
    mapToSortingTableValue,
    transformSortingValueToParams,
} from '@/components/ui/handle-sorting.utils';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable, DataTableHeadBarOptions } from 'filigran-ui/clients';
import { Input } from 'filigran-ui/servers';
import * as React from 'react';
import { useState } from 'react';
import {
    PreloadedQuery,
    usePreloadedQuery,
    useRefetchableFragment,
} from 'react-relay';
import {fileList$data, fileList$key} from "../../../../__generated__/fileList.graphql";
import {FileListQuery, filesFragment} from "@/components/service/vault/file.graphql";
import {fileQuery, fileQuery$variables} from "../../../../__generated__/fileQuery.graphql";
import {documentListLocalStorage} from "@/components/service/vault/document-list-localstorage";
import {VaultForm} from "@/components/service/vault/vault-form";
import { useTranslations } from 'next-intl';
import {
    OrderingMode,
    DocumentOrdering,
} from '../../../../__generated__/fileQuery.graphql';
import {fileQuery$variables} from "../../../../__generated__/fileQuery.graphql";
interface ServiceProps {
    queryRef: PreloadedQuery<fileQuery>;
    columns: ColumnDef<fileList$data>[];
}

const FileList: React.FunctionComponent<ServiceProps> = ({
         queryRef,
         columns,
     }) => {
    const queryData = usePreloadedQuery<fileQuery>(FileListQuery, queryRef);
    const t = useTranslations();
    const [data, refetch] = useRefetchableFragment<fileQuery, fileList$key>(
        filesFragment,
        queryData
    );

    const documentData = data.documents.edges.map(({ node }) => ({
        ...node,
    }))

    const {
        pageSize,
        setPageSize,
        orderMode,
        setOrderMode,
        orderBy,
        setOrderBy,
        columnOrder,
        setColumnOrder,
        columnVisibility,
        setColumnVisibility,
        resetAll,
    } = documentListLocalStorage(columns);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });


    const handleRefetchData = (args?: Partial<fileQuery$variables>) => {
        const sorting = mapToSortingTableValue(orderBy, orderMode);
        refetch({
            count: pagination.pageSize,
            cursor: btoa(String(pagination.pageSize * pagination.pageIndex)),
            orderBy,
            orderMode,
            ...transformSortingValueToParams(sorting),
            ...args,
        });
    };

    const onSortingChange = (updater: unknown) => {
        const sorting = mapToSortingTableValue(orderBy, orderMode);
        const newSortingValue =
            updater instanceof Function ? updater(sorting) : updater;
        setOrderBy(newSortingValue[0].id);
        setOrderMode(newSortingValue[0].desc ? 'desc' : 'asc');
        handleRefetchData(
            transformSortingValueToParams<DocumentOrdering, OrderingMode>(newSortingValue)
        );
    };

    const onPaginationChange = (updater: unknown) => {
        const newPaginationValue: PaginationState =
            updater instanceof Function ? updater(pagination) : updater;
        handleRefetchData({
            count: newPaginationValue.pageSize,
            cursor: btoa(
                String(newPaginationValue.pageSize * newPaginationValue.pageIndex)
            ),
        });
        setPagination(newPaginationValue);
        if (newPaginationValue.pageSize !== pageSize) {
            setPageSize(newPaginationValue.pageSize);
        }
    };

    const handleInputChange = (inputValue: string) => {
        refetch({
            filter: inputValue,
        });
    };



    return (
        <DataTable
            columns={columns}
            data={documentData}
            onResetTable={resetAll}
            tableOptions={{
                onSortingChange: onSortingChange,
                onPaginationChange: onPaginationChange,
                onColumnOrderChange: setColumnOrder,
                onColumnVisibilityChange: setColumnVisibility,
                manualSorting: true,
                manualPagination: true,
                rowCount: data.documents.totalCount,
            }}
            toolbar={
                <div className="flex-col-reverse sm:flex-row flex items-center justify-between gap-s">
                    <Input
                        className="w-full sm:w-1/3"
                        placeholder={t('Service.Vault.FileTab.Search')}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                    <div className="justify-between flex w-full sm:w-auto items-center gap-s">
                        <DataTableHeadBarOptions />
                        <VaultForm/>
                    </div>
                </div>
            }
            tableState={{
                sorting: mapToSortingTableValue(orderBy, orderMode),
                pagination,
                columnOrder,
                columnVisibility,
            }}
        />
    )


}

export default FileList;