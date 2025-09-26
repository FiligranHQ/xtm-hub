import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { useCustomDashboardsContext } from '@/components/service/custom-dashboards/use-custom-dashboards-context';
import { documentBase } from '@/components/service/document/document.graphql';
import { customDashboardsList$key } from '@generated/customDashboardsList.graphql';
import { customDashboardsQuery } from '@generated/customDashboardsQuery.graphql';
import {
  documentBase_fragment$data,
  documentBase_fragment$key,
} from '@generated/documentBase_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  customDashboardsFragment,
  CustomDashboardsListQuery,
} from '../custom-dashboard.graphql';

interface CustomDashboardsListProps {
  queryRef: PreloadedQuery<customDashboardsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CustomDashboardsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
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
    documentBase_fragment$data,
    documentBase_fragment$key
  >(data?.customDashboards.edges, documentBase);

  const connectionId = data?.customDashboards.__id;

  const context = useCustomDashboardsContext(serviceInstance, connectionId);

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
export default CustomDashboardsList;
