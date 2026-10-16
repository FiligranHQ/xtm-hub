'use client';

import { registeredPlatformByServiceInstanceId } from '@/components/registration/register/register.graphql';
import { PlatformInformation } from '@/components/service/registration/PlatformInformation';
import { RegisteredPlatformHeader } from '@/components/service/registration/RegisteredPlatformHeader';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { registeredPlatformByServiceInstanceIdQuery } from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface RegisteredPlatformOverviewProps {
  params: Promise<{ serviceInstanceId: string }>;
}

export const RegisteredPlatformOverview = ({
  params,
}: RegisteredPlatformOverviewProps) => {
  const { serviceInstanceId } = use(params);
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);

  const queryData =
    useLazyLoadQuery<registeredPlatformByServiceInstanceIdQuery>(
      registeredPlatformByServiceInstanceId,
      {
        input: {
          service_instance_id: decodedServiceInstanceId,
        },
      }
    );

  if (!queryData.registeredPlatform) {
    notFound();
  }

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: queryData.registeredPlatform.title,
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <RegisteredPlatformHeader
        registeredPlatform={queryData.registeredPlatform}
      />
      <PlatformInformation registeredPlatform={queryData.registeredPlatform} />
    </>
  );
};
