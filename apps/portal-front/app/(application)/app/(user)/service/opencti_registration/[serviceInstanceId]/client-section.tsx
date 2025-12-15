'use client';

import { registeredPlatformByServiceInstanceId } from '@/components/registration/register/register.graphql';
import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import { TrialDetails } from '@/components/service/trial-instances/trial-details';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
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

  if (
    !queryData.registeredPlatform ||
    queryData.registeredPlatform.contract !== PlatformContractEnum.TRIAL
  ) {
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
      {queryData.registeredPlatform.contract === PlatformContractEnum.TRIAL && (
        <>
          <TrialsHeader actions={<ContactUsButton variant="gradient" />} />
          <TrialDetails registeredPlatform={queryData.registeredPlatform} />
        </>
      )}
    </>
  );
};

export default ClientSection;
