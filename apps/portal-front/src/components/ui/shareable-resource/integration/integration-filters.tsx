import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration/integration-type-filter';
import React from 'react';

export const IntegrationFilters: React.FC = () => {
  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter />
    </div>
  );
};
