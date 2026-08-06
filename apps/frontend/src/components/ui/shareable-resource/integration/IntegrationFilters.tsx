import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration/IntegrationTypeFilter';

interface IntegrationFiltersProps {
  isSolutionCategoriesEnabled?: boolean;
}

export const IntegrationFilters = ({
  isSolutionCategoriesEnabled,
}: IntegrationFiltersProps = {}) => {
  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter
        isSolutionCategoriesEnabled={isSolutionCategoriesEnabled}
      />
    </div>
  );
};
