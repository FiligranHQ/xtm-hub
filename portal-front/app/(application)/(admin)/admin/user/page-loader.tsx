'use client';

import UserList, { UserData } from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { UserListQuery } from '@/components/admin/user/user.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import useMountingLoader from '@/hooks/useMountingLoader';
import { UseTranslationsProps } from '@/i18n/config';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import { userQuery } from '../../../../../__generated__/userQuery.graphql';

// Component interface
interface PreloaderProps {}

const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'first_name',
    id: 'first_name',
    header: 'First name',
  },
  {
    accessorKey: 'last_name',
    id: 'last_name',
    header: 'Last name',
  },
  {
    accessorKey: 'email',
    id: 'email',
    header: 'Email',
    cell: ({ row }) => {
      return <span className="truncate">{row.original.email}</span>;
    },
  },
];
const breadcrumbValue = (t: UseTranslationsProps) => [
  {
    label: t('MenuLinks.Backoffice'),
  },
  {
    label: t('MenuLinks.Users'),
  },
];
// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = () => {
  const t = useTranslations();
  const [queryRef, loadQuery] = useQueryLoader<userQuery>(UserListQuery);
  const { count, orderBy, orderMode } = useUserListLocalstorage(columns);
  useMountingLoader(loadQuery, { count, orderBy, orderMode });
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue(t)} />
      <h1 className="pb-s">Users list</h1>
      {queryRef ? (
        <UserList
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
