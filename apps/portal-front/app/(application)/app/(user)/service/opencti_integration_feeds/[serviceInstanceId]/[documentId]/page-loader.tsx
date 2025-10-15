'use client';

import Loader from '@/components/loader';
import IntegrationFeedSlug from '@/components/service/integration-feeds/[slug]/integration-feed-slug';
import { IntegrationFeedQuery } from '@/components/service/integration-feeds/integration-feed.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { integrationFeedQuery } from '@generated/integrationFeedQuery.graphql';
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
  const [queryRef, loadQuery] =
    useQueryLoader<integrationFeedQuery>(IntegrationFeedQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: serviceInstance?.id,
  });

  return queryRef && serviceInstance ? (
    <IntegrationFeedSlug
      serviceInstance={serviceInstance}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
