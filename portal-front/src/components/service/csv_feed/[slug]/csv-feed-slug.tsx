import * as React from 'react';

import { AspectRatio } from 'filigran-ui/servers';
import Image from 'next/image';

import {
  csvFeedItem,
  CsvFeedQuery,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { csvFeedItem_fragment$key } from '@generated/csvFeedItem_fragment.graphql';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface CsvFeedSlugProps {
  queryRef: PreloadedQuery<csvFeedsQuery>;
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
    <ShareableResourceSlug
      breadcrumbValue={breadcrumbValue}
      documentData={documentData}
      serviceInstance={serviceInstance}>
      <AspectRatio
        ratio={16 / 9}
        className="rounded-t overflow-hidden">
        <Image
          fill
          src={`/document/visualize/${documentData!.id}/${documentData.children_documents[0].id}`}
          objectPosition="top"
          objectFit="cover"
          alt={`Illustration of ${documentData.name}`}
        />
      </AspectRatio>
    </ShareableResourceSlug>
  );
};

// Component export
export default CsvFeedSlug;
