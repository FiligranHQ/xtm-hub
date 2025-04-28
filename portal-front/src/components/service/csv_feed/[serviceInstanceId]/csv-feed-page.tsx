import CsvFeedsList from '@/components/service/csv_feed/[serviceInstanceId]/csv-feeds-list';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery } from 'react-relay';

interface CsvFeedPageProps {
  queryRef: PreloadedQuery<csvFeedsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CsvFeedPage = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: CsvFeedPageProps) => {
  return (
    queryRef && (
      <>
        <CsvFeedsList
          serviceInstance={serviceInstance}
          queryRef={queryRef}
          search={search}
          onSearchChange={onSearchChange}
          onLabelFilterChange={onLabelFilterChange}
          labels={labels}
        />
      </>
    )
  );
};
export default CsvFeedPage;
