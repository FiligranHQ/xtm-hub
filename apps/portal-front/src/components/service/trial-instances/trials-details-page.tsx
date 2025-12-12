import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import React from 'react';
import { ContactUsButton } from './contact-us-button';
import { TrialDetails } from './trial-details';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsDetailsPage: React.FC<Props> = ({ platform }) => {
  return (
    <>
      <TrialsHeader actions={<ContactUsButton variant="gradient" />} />
      <TrialDetails platform={platform} />
    </>
  );
};
