import {
  openAEVScenariosFragment,
  openAEVScenariosItem,
  OpenAEVScenariosListQuery,
} from '@/components/service/obas-scenarios/openAEV-scenario.graphql';

import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useOpenAEVScenarioContext } from '@/components/service/obas-scenarios/use-openAEV-scenario-context';

import {
  openAEVScenariosItem_fragment$data,
  openAEVScenariosItem_fragment$key,
} from '@generated/openAEVScenariosItem_fragment.graphql';
import { openAEVScenariosList$key } from '@generated/openAEVScenariosList.graphql';
import { openAEVScenariosQuery } from '@generated/openAEVScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface OpenAEVScenariosListProps {
  queryRef: PreloadedQuery<openAEVScenariosQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const OpenAEVScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: OpenAEVScenariosListProps) => {
  const queryData = usePreloadedQuery<openAEVScenariosQuery>(
    OpenAEVScenariosListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    openAEVScenariosQuery,
    openAEVScenariosList$key
  >(openAEVScenariosFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    openAEVScenariosItem_fragment$data,
    openAEVScenariosItem_fragment$key
  >(data?.openAEVScenarios.edges, openAEVScenariosItem);

  const connectionId = data?.openAEVScenarios.__id;

  const context = useOpenAEVScenarioContext(serviceInstance, connectionId);

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

export default OpenAEVScenariosList;
