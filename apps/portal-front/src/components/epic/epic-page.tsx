'use client';
import { EpicList } from '@/components/epic/epic-list';
import { useEpicFilter } from '@/hooks/useEpicFilter';
import { EpicListContext } from '@/hooks/useEpicListContext';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';

interface EpicPageProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
  connectionID: string;
}

export const EpicPage = ({
  epics,
  serviceInstance,
  connectionID,
}: EpicPageProps) => {
  const { selectedProduct, setSelectedProduct } = useEpicFilter();

  return (
    <EpicListContext.Provider value={{ connectionID }}>
      <EpicList
        epics={epics}
        serviceInstance={serviceInstance}
        selectedProduct={selectedProduct}
        onFilterChange={setSelectedProduct}
      />
    </EpicListContext.Provider>
  );
};
