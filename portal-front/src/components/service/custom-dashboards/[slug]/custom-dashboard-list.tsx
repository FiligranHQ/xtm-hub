import {
  documentsList$data,
  documentsList$key,
} from '@generated/documentsList.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  documentsFragment,
  DocumentsListQuery,
} from '../../document/document.graphql';
import CustomDashboardCard from '../custom-dashboard-card';
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

  const [active, _nonActive] = useMemo(() => {
    return data?.documents.edges.reduce<
      [
        documentsList$data['documents']['edges'][0]['node'][],
        documentsList$data['documents']['edges'][0]['node'][],
      ]
    >(
      (acc, { node }) => {
        if (node.active) {
          acc[0].push(node);
        } else {
          acc[1].push(node);
        }
        return acc;
      },
      [[], []]
    );
  }, [data]);

  return (
    <div className="flex flex-col gap-l">
      <div className="flex justify-between">
        <h1>{serviceInstance.name}</h1>
        <CustomDashboardSheet
          serviceInstanceId={serviceInstance.id}
          connectionId={data!.documents!.__id}
        />
      </div>
      {/* TODO: add tabs to show non active dashboards for UPLOAD or BYPASS capas */}
      <ul
        className={
          'grid grid-cols-1 s:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-m'
        }>
        {[...active, ..._nonActive].map((node) => (
          <CustomDashboardCard
            serviceInstance={serviceInstance}
            connectionId={data!.documents!.__id}
            key={node.id}
            data={node}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomDashbordDocumentList;
