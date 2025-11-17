import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { IntegrationFeedConnectorTypeFilter } from '@/components/ui/shareable-resource/integration-feed/integration-feed-connector-type-filter';
import { IntegrationFeedTypeFilter } from '@/components/ui/shareable-resource/integration-feed/integration-feed-type-filter';
import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import React from 'react';

export const IntegrationFeedFilters: React.FC = () => {
  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { integrationTypes } = useServiceListLocalStorage(localStorageKey);
  const shouldDisplayConnectorFilter = integrationTypes.includes(
    IntegrationFeedTypeEnum.CONNECTOR
  );

  return (
    <div className="flex justify-between gap-s">
      <IntegrationFeedTypeFilter />
      {shouldDisplayConnectorFilter && <IntegrationFeedConnectorTypeFilter />}
    </div>
  );
};
