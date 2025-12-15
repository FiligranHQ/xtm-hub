import { TrialsTabQuotasPlatform } from '@/components/trials/tab/quotas/platform/trials-tab-quotas-platform';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';

export const TrialsTabQuotas: React.FC = () => {
  const platformIdentifiers = Object.values(PlatformIdentifierEnum);
  return (
    <>
      {platformIdentifiers.map((platformIdentifier) => (
        <TrialsTabQuotasPlatform
          key={platformIdentifier}
          platformIdentifier={platformIdentifier}
        />
      ))}
    </>
  );
};
