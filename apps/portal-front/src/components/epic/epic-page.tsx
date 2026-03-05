'use client';
import { EpicList } from '@/components/epic/epic-list';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { createContext, useContext, useState } from 'react';
interface EpicListConnectionContextType {
  connectionID: string;
  filterByProduct: (product: FiligranProductEnum) => void;
}

// Custom hook to use the ConnectionContext
export const useEpicListContext = (): EpicListConnectionContextType => {
  const context = useContext(EpicListContext);
  if (!context) {
    throw new Error(
      'useEpicListContext must be used within a ConnectionProvider'
    );
  }
  return context;
};
const EpicListContext = createContext<
  EpicListConnectionContextType | undefined
>(undefined);

interface EpicListProps {
  epics: epic_fragment$data[];
  serviceInstance: serviceInstance_fragment$data;
  connectionID: string;
}

export const EpicPage = ({
  epics,
  serviceInstance,
  connectionID,
}: EpicListProps) => {
  const [selectedProduct, setSelectedProduct] = useState<
    FiligranProductEnum | 'all'
  >('all');

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
      />
    </EpicListContext.Provider>
  );
};
