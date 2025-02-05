import { documentsList$key } from '@generated/documentsList.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  documentsFragment,
  DocumentsListQuery,
} from '../../document/document.graphql';
import { CustomDashboardSheet } from '../custom-dashboard-sheet';

interface CustomDashbordDocumentListProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const CustomDashbordDocumentList = ({
  queryRef,
  serviceInstance,
}: CustomDashbordDocumentListProps) => {
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<documentsQuery, documentsList$key>(
    documentsFragment,
    queryData
  );

  return (
    <CustomDashboardSheet
      serviceInstanceId={serviceInstance.id}
      connectionId={data?.documents.__id}
    />
  );
};

export default CustomDashbordDocumentList;
