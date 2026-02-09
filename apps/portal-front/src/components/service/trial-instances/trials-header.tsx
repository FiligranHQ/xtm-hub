import { PlatformTranslationMapping } from '@/components/registration/platform-identifier-mapping';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';

interface Props {
  actions?: React.ReactNode;
  platformIdentifier?: PlatformIdentifierEnum;
}

export const TrialsHeader: React.FC<Props> = ({
  actions,
  platformIdentifier = PlatformIdentifierEnum.OPENCTI,
}) => {
  const platformName = PlatformTranslationMapping[platformIdentifier];

  return (
    <header className="flex justify-between items-start my-xl">
      <div className="flex flex-col">
        <h2 className="text-blue text-2xl mb-2">Welcome to Filigran</h2>
        <h1 className="text-3xl">
          Let&apos;s get you started with your {platformName} free trial!
        </h1>
      </div>
      <div className="flex gap-s">{actions}</div>
    </header>
  );
};
