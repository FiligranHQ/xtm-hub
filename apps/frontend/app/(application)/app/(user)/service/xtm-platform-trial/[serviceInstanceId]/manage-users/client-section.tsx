'use client';

import { ManageTrialHeader } from '@/components/service/bundle/manage-trial/ManageTrialHeader';
import { ManageTrialRoleDescriptions } from '@/components/service/bundle/manage-trial/ManageTrialRoleDescriptions';
import { ManageTrialTable } from '@/components/service/bundle/manage-trial/ManageTrialTable';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { use } from 'react';
import { ServiceXtmPlatformBundleManageUsersPageProps } from './page';

const ClientSection = ({
  params,
}: ServiceXtmPlatformBundleManageUsersPageProps) => {
  const { serviceInstanceId } = use(params);
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);

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
        <ManageTrialHeader />
        <ManageTrialRoleDescriptions />
        <ManageTrialTable serviceInstanceId={decodedServiceInstanceId} />
      </div>
    </>
  );
};

export default ClientSection;
