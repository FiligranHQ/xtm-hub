import { AppServiceContext } from '@/components/service/components/service-context';
import ServiceList from '@/components/service/components/service-list';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { ServiceListLocalStorageKey } from '@/components/service/components/use-service-list-local-storage';
import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentsList$key } from '@generated/documentsList.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface CustomDashboardsListProps {
  queryRef: PreloadedQuery<documentsQuery>;
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
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<documentsQuery, documentsList$key>(
    documentsFragment,
    queryData
  );

  const [active, draft] = useActiveAndDraftSplit<
    documentItem_fragment$data,
    documentItem_fragment$key
  >(data?.documents.edges, documentItem);

  const connectionId = data?.documents.__id;

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
