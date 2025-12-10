import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialDetails: React.FC<Props> = ({ platform }) => {
  const t = useTranslations();
  return (
    <section className="flex justify-between p-xl border border-solid border-blue rounded">
      <ul className="text-sm flex flex-col gap-l">
        {platform.title && (
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
        )}
        {platform.deployment_request?.hub_status && (
          <li>
            <span className="text-gray/60">Status:</span>{' '}
            {formatTitleCase(platform.deployment_request?.hub_status)}
          </li>
        )}
        <li>
          <span className="text-gray/60">Start date:</span>{' '}
          {platform.subscription?.start_date && platform.subscription.end_date
            ? formatDate(platform.subscription.start_date)
            : '-'}
        </li>
        <li>
          <span className="text-gray/60">End date:</span>{' '}
          {platform.subscription?.end_date
            ? formatDate(platform.subscription?.end_date)
            : '-'}
        </li>
        {platform.deployment_request?.region && (
          <li>
            <span className="text-gray/60">Region:</span>{' '}
            {t(`Region.${platform.deployment_request.region.toUpperCase()}`)}
          </li>
        )}
        <li>
          <span className="text-gray/60">License:</span> Enterprise Edition
        </li>
      </ul>
      {platform.deployment_request?.hub_status ===
        DeploymentRequestHubStatusEnum.ACTIVE &&
        platform.url && (
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
        )}
    </section>
  );
};
