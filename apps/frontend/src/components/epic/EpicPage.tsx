'use client';
import { EpicList } from '@/components/epic/EpicList';
import { useEpicFilter } from '@/hooks/use-epic-filter';
import { EpicListContext } from '@/hooks/use-epic-list-context';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';

interface EpicPageProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
  connectionID: string;
  onSearch: (searchTerm: string) => void;
}

export const EpicPage = ({
  epics,
  serviceInstance,
  connectionID,
  onSearch,
}: EpicPageProps) => {
  const { selectedProduct, setSelectedProduct } = useEpicFilter();

  return (
    <EpicListContext.Provider value={{ connectionID }}>
      <EpicList
        epics={epics}
        serviceInstance={serviceInstance}
        selectedProduct={selectedProduct}
        onFilterChange={setSelectedProduct}
        onSearch={onSearch}
      />
    </EpicListContext.Provider>
  );
};
