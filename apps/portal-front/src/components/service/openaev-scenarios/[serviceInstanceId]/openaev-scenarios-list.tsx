import {
  openaevScenariosFragment,
  openaevScenariosItem,
  OpenaevScenariosListQuery,
} from '@/components/service/openaev-scenarios/openaev-scenario.graphql';

import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';

import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { ServiceListLocalStorageKey } from '@/components/service/components/use-service-list-local-storage';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
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
  search: string;
  onSearchChange: (v: string) => void;
}

const OpenaevScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
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

  const context = useDocumentContext({
    serviceInstance,
    connectionId,
    type: ShareableResourceType.OPENAEV_SCENARIO,
  });

  return (
    <AppServiceContext {...context}>
      <AppServiceListLocalStorageKeyContext
        localStorageKey={ServiceListLocalStorageKey.OpenAEVScenarios}>
        <ServiceList
          active={active}
          draft={draft}
          search={search}
          onSearchChange={onSearchChange}
        />
      </AppServiceListLocalStorageKeyContext>
    </AppServiceContext>
  );
};

export default OpenaevScenariosList;
