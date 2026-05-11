'use client';

import Loader from '@/components/Loader';
import { DocumentsItemQuery } from '@/components/service/document/document.graphql';
import OpenaevScenarioSlug from '@/components/service/openaev-scenarios/[slug]/OpenaevScenarioSlug';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { documentQuery } from '@generated/documentQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  documentId: string;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const PageLoader = ({ documentId, serviceInstance }: PreloaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<documentQuery>(DocumentsItemQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: serviceInstance?.id,
  });

  return queryRef && serviceInstance ? (
    <OpenaevScenarioSlug
      serviceInstance={serviceInstance}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
