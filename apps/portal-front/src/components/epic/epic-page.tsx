'use client';
import { EpicFilterType } from '@/components/epic/epic-filter';
import { EpicList } from '@/components/epic/epic-list';
import { EpicListContext } from '@/hooks/useEpicListContext';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useState } from 'react';

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
  const [selectedProduct, setSelectedProduct] = useState<EpicFilterType>('all');

  const filterByProduct = (product: FiligranProductEnum) => {
    setSelectedProduct(product);
  };

  return (
    <EpicListContext.Provider value={{ connectionID, filterByProduct }}>
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
