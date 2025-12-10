import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { DeploymentRequestHubStatus } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { DeploymentRequestPlatformRegion } from '@generated/trials_fragment.graphql';
import React from 'react';

interface Props {
  platformTitle?: string;
  hubStatus?: DeploymentRequestHubStatus;
  startDate?: string;
  endDate?: string;
  region?: DeploymentRequestPlatformRegion;
  actions?: React.ReactNode;
}

export const TrialDetails: React.FC<Props> = ({
  platformTitle,
  hubStatus,
  startDate,
  endDate,
  region,
  actions,
}) => {
  return (
    <section className="flex justify-between p-xl border border-solid border-blue rounded">
      <ul className="text-sm flex flex-col gap-l">
        {platformTitle && (
          <li>
            <span className="text-gray/60">Platform name:</span> {platformTitle}
          </li>
        )}
        {hubStatus && (
          <li>
            <span className="text-gray/60">Status:</span>{' '}
            {formatTitleCase(hubStatus)}
          </li>
        )}
        <li>
          <span className="text-gray/60">Start date:</span>{' '}
          {startDate && endDate ? formatDate(startDate) : '-'}
        </li>
        <li>
          <span className="text-gray/60">End date:</span>{' '}
          {endDate ? formatDate(endDate) : '-'}
        </li>
        {region && (
          <li>
            <span className="text-gray/60">Region:</span> {region.toUpperCase()}
          </li>
        )}
        <li>
          <span className="text-gray/60">License:</span> Enterprise Edition
        </li>
      </ul>
      {actions}
    </section>
  );
};
