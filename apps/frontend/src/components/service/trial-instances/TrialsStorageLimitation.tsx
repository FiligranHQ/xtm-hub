import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ReactNode } from 'react';

interface TrialsStorageLimitationProps {
  platformIdentifier: PlatformIdentifierEnum;
}

export const TrialsStorageLimitation = async ({
  platformIdentifier,
}: TrialsStorageLimitationProps) => {
  const t = await getTranslations();
  const isOpenCTI = platformIdentifier === PlatformIdentifierEnum.OPENCTI;

  const renderLink = (chunks: ReactNode) => (
    <Link
      href="https://filigran.io/offerings/software-as-a-service/"
      target="_blank"
      rel="noopener noreferrer"
      className="underline">
      {chunks}
    </Link>
  );
  const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>;

  return (
    <div className="p-6 rounded bg-white/[0.08]">
      <h2 className="text-blue text-2xl mb-l">
        {t('Service.Trials.Storage.Title')}
      </h2>
      <p className="text-sm mb-l">
        {t.rich(
          isOpenCTI
            ? 'Service.Trials.Storage.OpenCTIDescription'
            : 'Service.Trials.Storage.OpenAEVDescription',
          { link: renderLink, strong: renderStrong }
        )}
      </p>
      <p className="text-sm mb-l">
        {t.rich('Service.Trials.Storage.NoSLA', { strong: renderStrong })}
      </p>
    </div>
  );
};
