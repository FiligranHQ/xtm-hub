import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { ServiceListLocalStorageKey } from '@/components/service/components/use-service-list-local-storage';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  customDashboardsItem_fragment$data,
  customDashboardsItem_fragment$key,
} from '@generated/customDashboardsItem_fragment.graphql';
import { customDashboardsList$key } from '@generated/customDashboardsList.graphql';
import { customDashboardsQuery } from '@generated/customDashboardsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  customDashboardsFragment,
  customDashboardsItem,
  CustomDashboardsListQuery,
} from '../custom-dashboard.graphql';

interface CustomDashboardsListProps {
  queryRef: PreloadedQuery<customDashboardsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const CustomDashboardsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: CustomDashboardsListProps) => {
  const queryData = usePreloadedQuery<customDashboardsQuery>(
    CustomDashboardsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    customDashboardsQuery,
    customDashboardsList$key
  >(customDashboardsFragment, queryData);

  const [active, draft] = useActiveAndDraftSplit<
    customDashboardsItem_fragment$data,
    customDashboardsItem_fragment$key
  >(data?.customDashboards.edges, customDashboardsItem);

  const connectionId = data?.customDashboards.__id;

  const context = useDocumentContext({
    serviceInstance,
    connectionId,
    type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  });

  return (
    <AppServiceContext {...context}>
      <AppServiceListLocalStorageKeyContext
        localStorageKey={ServiceListLocalStorageKey.OpenCTICustomDashboards}>
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
export default CustomDashboardsList;
