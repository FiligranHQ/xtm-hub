import {
  openaevScenariosFragment,
  openaevScenariosItem,
  OpenaevScenariosListQuery,
} from '@/components/service/openaev-scenarios/openaev-scenario.graphql';

import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useOpenaevScenarioContext } from '@/components/service/openaev-scenarios/use-openaev-scenario-context';

import {
  openaevScenariosItem_fragment$data,
  openaevScenariosItem_fragment$key,
} from '@generated/openaevScenariosItem_fragment.graphql';
import { openaevScenariosList$key } from '@generated/openaevScenariosList.graphql';
import { openaevScenariosQuery } from '@generated/openaevScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface OpenAEVScenariosListProps {
  queryRef: PreloadedQuery<openaevScenariosQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const OpenaevScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: OpenAEVScenariosListProps) => {
  const queryData = usePreloadedQuery<openaevScenariosQuery>(
    OpenaevScenariosListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    openaevScenariosQuery,
    openaevScenariosList$key
  >(openaevScenariosFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    openaevScenariosItem_fragment$data,
    openaevScenariosItem_fragment$key
  >(data?.openAEVScenarios.edges, openaevScenariosItem);

  const connectionId = data?.openAEVScenarios.__id;

  const context = useOpenaevScenarioContext(serviceInstance, connectionId);

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

export default OpenaevScenariosList;
