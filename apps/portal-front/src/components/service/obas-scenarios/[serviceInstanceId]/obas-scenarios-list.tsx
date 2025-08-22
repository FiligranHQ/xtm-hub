import {
  obasScenariosFragment,
  obasScenariosItem,
  ObasScenariosListQuery,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';

import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useObasScenarioContext } from '@/components/service/obas-scenarios/use-obas-scenario-context';
import {
  obasScenariosItem_fragment$data,
  obasScenariosItem_fragment$key,
} from '@generated/obasScenariosItem_fragment.graphql';
import { obasScenariosList$key } from '@generated/obasScenariosList.graphql';
import { obasScenariosQuery } from '@generated/obasScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface ObasScenariosListProps {
  queryRef: PreloadedQuery<obasScenariosQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const ObasScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: ObasScenariosListProps) => {
  const queryData = usePreloadedQuery<obasScenariosQuery>(
    ObasScenariosListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    obasScenariosQuery,
    obasScenariosList$key
  >(obasScenariosFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    obasScenariosItem_fragment$data,
    obasScenariosItem_fragment$key
  >(data?.obasScenarios.edges, obasScenariosItem);

  const connectionId = data?.obasScenarios.__id;

  const context = useObasScenarioContext(serviceInstance, connectionId);

  return (
    <AppServiceContext {...context}>
      <ServiceList
        active={active}
        draft={draft}
        search={search}
        onSearchChange={onSearchChange}
        labels={labels}
        onLabelFilterChange={onLabelFilterChange}
      />
    </AppServiceContext>
  );
};

export default ObasScenariosList;
