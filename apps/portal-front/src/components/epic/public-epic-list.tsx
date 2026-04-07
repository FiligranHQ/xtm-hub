import { EpicList } from '@/components/epic/epic-list';
import {
  EpicListQuery,
  epicsListFragment,
} from '@/components/epic/epic.graphql';
import { useEpicFilter } from '@/hooks/useEpicFilter';
import { EpicListContext } from '@/hooks/useEpicListContext';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { epicsList_epics$key } from '@generated/epicsList_epics.graphql';
import { epicsQuery } from '@generated/epicsQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import React from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  queryRef: PreloadedQuery<epicsQuery>;
}

const PublicEpicList: React.FC<Props> = ({ queryRef, serviceInstance }) => {
  const queryData = usePreloadedQuery<epicsQuery>(EpicListQuery, queryRef);

  const [data, refetch] = useRefetchableFragment<
    epicsQuery,
    epicsList_epics$key
  >(epicsListFragment, queryData);

  const { selectedProduct, setSelectedProduct } = useEpicFilter();

  const epics = data.epics!.edges.map(
    (edge) => edge.node as epic_fragment$data
  );

  const handleSearch = (searchTerm: string) => {
    refetch({ searchTerm: searchTerm || undefined });
  };

  const connectionID = data.epics!.__id;
  return (
    <EpicListContext.Provider value={{ connectionID }}>
      <EpicList
        epics={epics}
        serviceInstance={serviceInstance}
        selectedProduct={selectedProduct}
        onFilterChange={setSelectedProduct}
        onSearch={handleSearch}
      />
    </EpicListContext.Provider>
  );
};

export default PublicEpicList;
