'use client';

import Loader from '@/components/loader';
import CsvFeedSlug from '@/components/service/csv-feeds/[slug]/csv-feed-slug';
import { CsvFeedQuery } from '@/components/service/csv-feeds/csv-feed.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  documentId: string;
  service: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  documentId,
  service,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<csvFeedQuery>(CsvFeedQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: service?.id,
  });

  return queryRef && service ? (
    <CsvFeedSlug
      serviceInstance={service}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
