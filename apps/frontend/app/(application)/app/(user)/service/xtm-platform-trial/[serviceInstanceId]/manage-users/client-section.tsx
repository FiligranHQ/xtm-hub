'use client';

import { ManageTrialHeader } from '@/components/service/bundle/manage-trial/ManageTrialHeader';
import { ManageTrialRoleDescriptions } from '@/components/service/bundle/manage-trial/ManageTrialRoleDescriptions';
import { ManageTrialTable } from '@/components/service/bundle/manage-trial/ManageTrialTable';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import { SelectionState } from '@filigran/ui';
import { useBundleUserServiceGroupsQuery } from '@graphql/generated';
import { bundleUserServiceGroupsKeys } from '@graphql/service-group/service-group.keys';
import { use, useMemo, useState } from 'react';
import { ServiceXtmPlatformBundleManageUsersPageProps } from './page';

const emptySelection = (): SelectionState => ({
  selectAll: false,
  selectedIds: new Set<string>(),
  excludedIds: new Set<string>(),
});

const ClientSection = ({
  params,
}: ServiceXtmPlatformBundleManageUsersPageProps) => {
  const { serviceInstanceId } = use(params);
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);

  const [selection, setSelection] = useState<SelectionState>(emptySelection);

  const variables = { serviceInstanceId: decodedServiceInstanceId };
  const { data: queryData } = useBundleUserServiceGroupsQuery(
    portalGraphqlClient,
    variables,
    { queryKey: bundleUserServiceGroupsKeys.list(variables) }
  );

  const selectedUsers = useMemo(() => {
    const users = queryData?.bundleUserServiceGroups ?? [];

    const selectedRows = selection.selectAll
      ? users.filter((row) => !selection.excludedIds.has(row.user.id))
      : users.filter((row) => selection.selectedIds.has(row.user.id));

    return selectedRows.map((row) => ({
      id: row.user.id,
      email: row.user.email,
    }));
  }, [queryData, selection]);

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'Service.Bundle.ManageTrial.Breadcrumb.BundleName',
    },
    {
      label: 'Service.Bundle.ManageTrial.Breadcrumb.ManageUsers',
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <div className="flex flex-col gap-l">
        <ManageTrialHeader
          serviceInstanceId={decodedServiceInstanceId}
          selectedUsers={selectedUsers}
          onUsersRemoved={() => setSelection(emptySelection())}
        />
        <ManageTrialRoleDescriptions />
        <ManageTrialTable
          serviceInstanceId={decodedServiceInstanceId}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </div>
    </>
  );
};

export default ClientSection;
