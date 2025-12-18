import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { IntegrationConnectorTypeFilter } from '@/components/ui/shareable-resource/integration-feed/integration-connector-type-filter';
import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration-feed/integration-type-filter';
import { IntegrationsTypeEnum } from '@generated/models/IntegrationsType.enum';
import React from 'react';

export const IntegrationFilters: React.FC = () => {
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { integrationTypes } = useServiceListLocalStorage(localStorageKey);
  const shouldDisplayConnectorFilter = integrationTypes.includes(
    IntegrationsTypeEnum.CONNECTOR
  );

  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter />
      {shouldDisplayConnectorFilter && <IntegrationConnectorTypeFilter />}
    </div>
  );
};
