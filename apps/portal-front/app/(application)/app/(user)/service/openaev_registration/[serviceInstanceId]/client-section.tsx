'use client';

import { registeredPlatformByServiceInstanceId } from '@/components/registration/register/register.graphql';
import { RegistrationDetails } from '@/components/service/registration/registration-details';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/reach-sales-button';
import { SlackSupportButton } from '@/components/service/trial-instances/slack-support';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registeredPlatformByServiceInstanceIdQuery } from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
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
    queryData.registeredPlatform.contract === PlatformContractEnum.TRIAL;

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {isTrial && (
        <TrialsHeader
          platformIdentifier={PlatformIdentifierEnum.OPENAEV}
          actions={
            <>
              <SlackSupportButton />
              <ReachSalesButton variant="gradient" />
            </>
          }
        />
      )}
      <RegistrationDetails registeredPlatform={queryData.registeredPlatform} />
      {isTrial && <TrialsLearnMore />}
    </>
  );
};

export default ClientSection;
