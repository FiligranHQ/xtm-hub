import { ServiceListFacetCounts } from '@/components/service/components/header/filter/service-list-facet-counts';
import { IntegrationTypeFilter } from '@/components/ui/shareable-resource/integration/IntegrationTypeFilter';

interface IntegrationFiltersProps {
  facetCounts?: ServiceListFacetCounts['integrationType'];
}

export const IntegrationFilters = ({
  facetCounts,
}: IntegrationFiltersProps) => {
  return (
    <div className="flex justify-between gap-s">
      <IntegrationTypeFilter facetCounts={facetCounts} />
    </div>
  );
};
