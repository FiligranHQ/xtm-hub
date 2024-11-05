'use client';

import FileList from '@/components/service/vault/file-list'
import useMountingLoader from '@/hooks/useMountingLoader';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import {FileListQuery} from "@/components/service/vault/file.graphql";
import {fileList$data} from "../../../../../__generated__/fileList.graphql";
import {fileQuery} from "../../../../../__generated__/fileQuery.graphql";
import {documentListLocalStorage} from "@/components/service/vault/document-list-localstorage";
import {IconActions} from "@/components/ui/icon-actions";
import { MoreVertIcon } from 'filigran-icon';
import EditDocument from "@/components/service/vault/edit-document";
import {FormatDate} from "@/utils/date";
import {getUserLocale} from "@/i18n/locale";
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PreloaderProps {}

const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
    const t = useTranslations();
    const [locale, setLocale] = useState('fr-FR');

    const fetchLocale = async () => {
        const userLocale = await getUserLocale();
        setLocale(userLocale === 'en' ? 'en-US' : 'fr-FR');
    };
    fetchLocale();


    const columns: ColumnDef<fileList$data>[] = [
        {
            accessorKey: 'file_name',
            id: 'file_name',
            header: t('Service.Vault.FileTab.FileName'),
        },
        {
            id: 'created_at',
            header: t('Service.Vault.FileTab.UploadDate'),
            cell: ({row}) => <>{FormatDate(row.original.created_at as string, false, locale)}</>
        },
        {
            accessorKey: 'description',
            id: 'description',
            header: t('Service.Vault.FileTab.Description')
        },
        {
            id: 'actions',
            size: 100,
            enableHiding: false,
            enableSorting: false,
            enableResizing: false,
            cell: ({ row }) => (
                <IconActions
                    icon={
                        <>
                            <MoreVertIcon className="h-4 w-4" />
                            <span className="sr-only">{t('Utils.OpenMenu')}</span>
                        </>
                    }>
                    <EditDocument documentData={row.original} />
                </IconActions>
            ),
        },
    ];


    const [queryRef, loadQuery] = useQueryLoader<fileQuery>(FileListQuery);
    const { count, orderBy, orderMode } = documentListLocalStorage(columns);
    useMountingLoader(loadQuery, { count, orderBy, orderMode });
    return (
        <>
            <h1 className="pb-s">{t('Service.Vault.Vault')}</h1>
            {queryRef ? (
                <FileList
                    queryRef={queryRef}
                    columns={columns}
                />
            ) : (
                <DataTable
                    data={[]}
                    columns={columns}
                    isLoading={true}
                />
            )}
        </>
    );

};

// Component export
export default PageLoader;
