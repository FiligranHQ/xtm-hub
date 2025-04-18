import { CSVFeedAddSheet } from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed-add-sheet';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery } from 'react-relay';

interface CsvFeedPageProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const CsvFeedPage = ({ queryRef, serviceInstance }: CsvFeedPageProps) => {
  return (
    queryRef && (
      <CSVFeedAddSheet
        serviceInstance={serviceInstance}
        connectionId={''}
      />
    )
  );
};
export default CsvFeedPage;
