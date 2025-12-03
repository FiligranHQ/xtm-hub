import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
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
  return (
    <>
      <TrialsHeader actions={<ContactUsButton variant="gradient" />} />
      <section className="flex justify-between p-xl border border-solid border-blue rounded">
        <ul className="text-sm flex flex-col gap-l">
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
          {platform.deployment_request?.hub_status && (
            <li>
              <span className="text-gray/60">Status:</span>{' '}
              {formatTitleCase(platform.deployment_request?.hub_status)}
            </li>
          )}
          {platform.subscription?.start_date && (
            <li>
              <span className="text-gray/60">Start date & End date:</span>{' '}
              {formatDate(platform.subscription?.start_date)}{' '}
              {platform.subscription?.end_date &&
                `- ${formatDate(platform.subscription.end_date)}`}
            </li>
          )}
          <li>
            <span className="text-gray/60">License:</span> Enterprise Edition
          </li>
        </ul>

        <div className="flex flex-col gap-m">
          {platform.url && (
            <Button>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={platform.url}>
                Access OpenCTI
              </Link>
            </Button>
          )}
          {platform.deployment_request?.hub_status ===
            DeploymentRequestHubStatusEnum.ACTIVE && (
            <TrialsManageUsersDialog platform={platform} />
          )}
        </div>
      </section>
      <TrialsLearnMore />
    </>
  );
};
