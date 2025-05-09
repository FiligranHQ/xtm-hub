import * as React from 'react';

import {
  csvFeedItem,
  CsvFeedQuery,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { csvFeedItem_fragment$key } from '@generated/csvFeedItem_fragment.graphql';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
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
  const documentData = readInlineData<csvFeedItem_fragment$key>(
    csvFeedItem,
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
