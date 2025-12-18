'use client';

import Loader from '@/components/loader';
import IntegrationSlug from '@/components/service/integration-feeds/[slug]/integration-slug';
import { IntegrationQuery } from '@/components/service/integration-feeds/integration.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { integrationQuery } from '@generated/integrationQuery.graphql';
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
    useQueryLoader<integrationQuery>(IntegrationQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: serviceInstance?.id,
  });

  return queryRef && serviceInstance ? (
    <IntegrationSlug
      serviceInstance={serviceInstance}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
