'use client';

import {
  registeredPlatformByServiceInstanceId,
  registeredPlatformByServiceInstanceIdFragment,
} from '@/components/registration/register/register.graphql';
import { TrialsDetailsPage } from '@/components/service/trial-instances/trials-details-page';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { registeredPlatformByServiceInstanceIdQuery } from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
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

  const data = useFragment<registeredPlatformByServiceInstanceId_fragment$key>(
    registeredPlatformByServiceInstanceIdFragment,
    queryData.registeredPlatform
  );

  if (!data || data.contract !== PlatformContractEnum.TRIAL) {
    notFound();
  }

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: data.title,
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {data.contract === PlatformContractEnum.TRIAL && (
        <TrialsDetailsPage platform={data} />
      )}
    </>
  );
};

export default Page;
