import {
  CsvFeedQuery,
  csvFeedsItem,
} from '@/components/service/csv-feeds/csv-feed.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { csvFeedsItem_fragment$key } from '@generated/csvFeedsItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface CsvFeedSlugProps {
  queryRef: PreloadedQuery<csvFeedQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const CsvFeedSlug: React.FunctionComponent<CsvFeedSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<csvFeedQuery>(CsvFeedQuery, queryRef);
  const documentData = readInlineData<csvFeedsItem_fragment$key>(
    csvFeedsItem,
    data.csvFeed
  );

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: serviceInstance?.name,
      href: `/service/csv_feed/${serviceInstance?.id}`,
      original: true,
    },
    {
      label: documentData?.name,
      original: true,
    },
  ];

  return (
    documentData && (
      <ShareableResourceSlug
        breadcrumbValue={breadcrumbValue}
        documentData={documentData}
      />
    )
  );
};

// Component export
export default CsvFeedSlug;
