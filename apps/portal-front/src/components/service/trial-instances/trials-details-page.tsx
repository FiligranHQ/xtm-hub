import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { TrialDetails } from '@/components/service/trial-instances/trial-details';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import React from 'react';
import { ContactUsButton } from './contact-us-button';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsDetailsPage: React.FC<Props> = ({ platform }) => {
  const shouldDisplayPlatformActions =
    platform.deployment_request?.hub_status ===
      DeploymentRequestHubStatusEnum.ACTIVE && platform.url;

  const actions = shouldDisplayPlatformActions ? (
    <div className="flex flex-col gap-m">
      <Button>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={platform.url}>
          Access OpenCTI
        </Link>
      </Button>

      <TrialsManageUsersDialog platform={platform} />
    </div>
  ) : null;

  return (
    <>
      <TrialsHeader actions={<ContactUsButton variant="gradient" />} />
      <TrialDetails
        platformTitle={platform.title}
        hubStatus={platform.deployment_request?.hub_status}
        startDate={platform.subscription?.start_date}
        endDate={platform.subscription?.end_date}
        region={platform.deployment_request?.region}
        actions={actions}
      />
      <TrialsLearnMore />
    </>
  );
};
