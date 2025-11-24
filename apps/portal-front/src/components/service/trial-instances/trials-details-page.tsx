import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { pageLoaderRegisteredPlatformByServiceInstanceId_fragment$data } from '@generated/pageLoaderRegisteredPlatformByServiceInstanceId_fragment.graphql';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import React from 'react';

interface Props {
  platform: pageLoaderRegisteredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsDetailsPage: React.FC<Props> = ({ platform }) => {
  return (
    <>
      <TrialsHeader actions={<ContactUsButton />} />
      <section className="flex justify-between p-xl border border-solid border-blue rounded">
        <ul className="text-sm flex flex-col gap-l">
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
          {platform.deployment_request?.status && (
            <li>
              <span className="text-gray/60">Registration status:</span>{' '}
              {formatTitleCase(platform.deployment_request?.status)}
            </li>
          )}
          {platform.deployment_request?.start_date && (
            <li>
              <span className="text-gray/60">Registration date:</span>{' '}
              {formatDate(platform.deployment_request?.start_date)}{' '}
              {platform.deployment_request?.end_date &&
                `- ${formatDate(platform.deployment_request.end_date)}`}
            </li>
          )}
          <li>
            <span className="text-gray/60">License:</span> Enterprise Edition
          </li>
        </ul>

        <Button>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={platform.url}>
            Access OpenCTI
          </Link>
        </Button>
      </section>
      <TrialsLearnMore />
    </>
  );
};
