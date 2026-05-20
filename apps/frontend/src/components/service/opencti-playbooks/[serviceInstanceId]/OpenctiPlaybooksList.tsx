import { useActiveAndDraftSplit } from '@/components/service/components/service-list-utils';
import { AppServiceContext } from '@/components/service/components/ServiceContext';
import ServiceList from '@/components/service/components/ServiceList';

import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { ServiceListLocalStorageKey } from '@/hooks/use-service-list-local-storage';
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

interface OpenCTIPlaybooksListProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const OpenctiPlaybooksList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: OpenCTIPlaybooksListProps) => {
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
    type: ShareableResourceType.OPENCTI_PLAYBOOK,
  });

  return (
    <AppServiceContext {...context}>
      <AppServiceListLocalStorageKeyContext
        localStorageKey={ServiceListLocalStorageKey.OpenCTIPlaybooks}>
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

export default OpenctiPlaybooksList;
