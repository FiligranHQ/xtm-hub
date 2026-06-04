'use client';

import { registeredPlatformByServiceInstanceId } from '@/components/registration/register/register.graphql';
import { RegistrationDetails } from '@/components/service/registration/RegistrationDetails';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/ReachSalesButton';
import { SlackSupportButton } from '@/components/service/trial-instances/SlackSupport';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registeredPlatformByServiceInstanceIdQuery } from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { ServiceOpenCTIRegistrationPageProps } from './page';

const ClientSection = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
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
    queryData.registeredPlatform.contract === PlatformContractEnum.TRIAL;

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {isTrial && (
        <TrialsHeader
          platformIdentifier={PlatformIdentifierEnum.OPENCTI}
          actions={
            <>
              <SlackSupportButton />
              <ReachSalesButton
                variant="gradient"
                platformId={queryData.registeredPlatform.platform_id}
                platformIdentifier={PlatformIdentifierEnum.OPENCTI}
              />
            </>
          }
        />
      )}
      <RegistrationDetails registeredPlatform={queryData.registeredPlatform} />
      {isTrial && (
        <TrialsLearnMore platformIdentifier={PlatformIdentifierEnum.OPENCTI} />
      )}
    </>
  );
};

export default ClientSection;
