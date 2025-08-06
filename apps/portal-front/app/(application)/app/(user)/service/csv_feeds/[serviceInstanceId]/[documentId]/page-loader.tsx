'use client';

import Loader from '@/components/loader';
import CsvFeedSlug from '@/components/service/csv-feeds/[slug]/csv-feed-slug';
import { CsvFeedQuery } from '@/components/service/csv-feeds/csv-feed.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  documentId: string;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  documentId,
  serviceInstance,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<csvFeedQuery>(CsvFeedQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: serviceInstance?.id,
  });

  return queryRef && serviceInstance ? (
    <CsvFeedSlug
      serviceInstance={serviceInstance}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
