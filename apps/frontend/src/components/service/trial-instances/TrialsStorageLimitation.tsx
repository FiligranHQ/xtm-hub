'use client';

import { useTranslate } from '@/hooks/use-translate';
import {
  FiligranWebsiteUtmCampaign,
  withFiligranWebsiteUtm,
} from '@/utils/filigran-website-utm';
import { PlatformIdentifier } from '@graphql/generated';
import Link from 'next/link';
import { ReactNode } from 'react';

interface TrialsStorageLimitationProps {
  platformIdentifier: PlatformIdentifier;
}

export const TrialsStorageLimitation = ({
  platformIdentifier,
}: TrialsStorageLimitationProps) => {
  const t = useTranslate();
  const isOpenCTI = platformIdentifier === PlatformIdentifier.Opencti;

  const renderLink = (chunks: ReactNode) => (
    <Link
      href={withFiligranWebsiteUtm(
        'https://filigran.io/offerings/software-as-a-service/',
        {
          campaign: FiligranWebsiteUtmCampaign.OTHER,
          content: 'trial_storage_saas_offering',
        }
      )}
      target="_blank"
      rel="noopener noreferrer"
      className="underline">
      {chunks}
    </Link>
  );
  const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>;

  return (
    <div className="p-6 rounded bg-elevation-default">
      <h2 className="text-filigran-brand-primary text-2xl mb-4">
        {t('Service.Trials.Storage.Title')}
      </h2>
      <p className="text-sm mb-4">
        {t.rich(
          isOpenCTI
            ? 'Service.Trials.Storage.OpenCTIDescription'
            : 'Service.Trials.Storage.OpenAEVDescription',
          { link: renderLink, strong: renderStrong }
        )}
      </p>
      <p className="text-sm mb-4">
        {t.rich('Service.Trials.Storage.NoSLA', { strong: renderStrong })}
      </p>
    </div>
  );
};
