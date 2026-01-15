import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { IntegrationSubTypeFilter } from '@/components/ui/shareable-resource/integration/integration-sub-type-filter';
import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration/integration-type-filter';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import React from 'react';

export const IntegrationFilters: React.FC = () => {
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { integrationTypes } = useServiceListLocalStorage(localStorageKey);
  const shouldDisplayIntegrationSubTypeFilter = integrationTypes.some((type) =>
    [
      IntegrationTypeEnum.CONNECTOR,
      IntegrationTypeEnum.TAXII_FEED,
      IntegrationTypeEnum.STREAM,
    ].includes(type)
  );

  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter />
      {shouldDisplayIntegrationSubTypeFilter && <IntegrationSubTypeFilter />}
    </div>
  );
};
