'use client';

import { DocumentsItemQuery } from '@/components/service/document/document.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useQueryLoader } from 'react-relay';
import Loader from '../../../../../../../../src/components/Loader';
import OpenaevScenarioSlug from '../../../../../../../../src/components/service/openaev-scenarios/[slug]/OpenaevScenarioSlug';
import useMountingLoader from '../../../../../../../../src/hooks/use-mounting-loader';

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
