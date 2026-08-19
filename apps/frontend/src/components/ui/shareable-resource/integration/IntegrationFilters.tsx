import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration/IntegrationTypeFilter';

export const IntegrationFilters = () => {
  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter />
    </div>
  );
};
