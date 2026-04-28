import React from 'react';
import { IntegrationTypeFilter } from './IntegrationTypeFilter';

export const IntegrationFilters: React.FC = () => {
  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter />
    </div>
  );
};
