'use client';

import { registeredPlatformByServiceInstanceId } from '@/components/registration/register/register.graphql';
import { RegistrationDetails } from '@/components/service/registration/RegistrationDetails';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/ReachSalesButton';
import { SlackSupportButton } from '@/components/service/trial-instances/SlackSupport';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { registeredPlatformByServiceInstanceIdQuery } from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
import { PlatformContract, PlatformIdentifier } from '@graphql/generated';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { ServiceOpenAEVRegistrationPageProps } from './page';

const ClientSection = ({ params }: ServiceOpenAEVRegistrationPageProps) => {
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

  const isTrial =
    queryData.registeredPlatform.contract === PlatformContract.Trial;

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {isTrial && (
        <TrialsHeader
          platformIdentifier={PlatformIdentifier.Openaev}
          actions={
            <>
              <SlackSupportButton />
              <ReachSalesButton
                variant="gradient"
                platformId={queryData.registeredPlatform.platform_id}
                platformIdentifier={PlatformIdentifier.Openaev}
              />
            </>
          }
        />
      )}
      <RegistrationDetails registeredPlatform={queryData.registeredPlatform} />
      {isTrial && (
        <TrialsLearnMore platformIdentifier={PlatformIdentifier.Openaev} />
      )}
    </>
  );
};

export default ClientSection;
