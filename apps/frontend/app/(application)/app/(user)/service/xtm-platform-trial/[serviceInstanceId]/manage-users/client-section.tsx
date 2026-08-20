'use client';

import { ManageTrialHeader } from '@/components/service/bundle/manage-trial/ManageTrialHeader';
import { ManageTrialRoleDescriptions } from '@/components/service/bundle/manage-trial/ManageTrialRoleDescriptions';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { use } from 'react';
import { ServiceXtmPlatformBundleManageUsersPageProps } from './page';

const ClientSection = ({
  params,
}: ServiceXtmPlatformBundleManageUsersPageProps) => {
  const { serviceInstanceId: _serviceInstanceId } = use(params);

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
      <div className="flex flex-col gap-xl">
        <ManageTrialHeader />
        <ManageTrialRoleDescriptions />
      </div>
    </>
  );
};

export default ClientSection;
