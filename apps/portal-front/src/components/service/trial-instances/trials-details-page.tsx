import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { Button, GradientButton } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsDetailsPage: React.FC<Props> = ({ platform }) => {
  const t = useTranslations();
  return (
    <>
      <TrialsHeader
        actions={
          <GradientButton>{t('Service.Trials.ContactUs')}</GradientButton>
        }
      />
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
          {platform.subscription?.start_date && (
            <li>
              <span className="text-gray/60">Registration date:</span>{' '}
              {formatDate(platform.subscription?.start_date)}{' '}
              {platform.subscription?.end_date &&
                `- ${formatDate(platform.subscription.end_date)}`}
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
