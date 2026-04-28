import {
  EpicListQuery,
  epicsListFragment,
} from '@/components/epic/epic.graphql';
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
import { useEpicFilter } from '../../hooks/use-epic-filter';
import { EpicListContext } from '../../hooks/use-epic-list-context';
import { EpicList } from './EpicList';

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
