'use client';
import { EpicFilterType } from '@/components/epic/epic-filter';
import { EpicList } from '@/components/epic/epic-list';
import { EpicTimelineFilterType } from '@/components/epic/epic-timeline-filter';
import { EpicListContext } from '@/hooks/useEpicListContext';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useState } from 'react';

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
  const [selectedProduct, setSelectedProduct] = useState<EpicFilterType>('all');
  const [selectedTimeline, setSelectedTimeline] =
    useState<EpicTimelineFilterType>('all');

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
        selectedTimeline={selectedTimeline}
        onTimelineChange={setSelectedTimeline}
      />
    </EpicListContext.Provider>
  );
};
