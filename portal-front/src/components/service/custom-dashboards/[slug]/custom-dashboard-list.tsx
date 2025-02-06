import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
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
import CustomDashbordCard from '../custom-dashboard-card';
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
    <div className="flex flex-col gap-l">
      <div className="flex items-center justify-end">
        <CustomDashboardSheet
          serviceInstanceId={serviceInstance.id}
          connectionId={data?.documents.__id}
        />
      </div>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-m'
        }>
        {data?.documents.edges.map(({ node }) => (
          <CustomDashbordCard
            key={node.id}
            customDashboard={node as documentItem_fragment$data}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomDashbordDocumentList;
