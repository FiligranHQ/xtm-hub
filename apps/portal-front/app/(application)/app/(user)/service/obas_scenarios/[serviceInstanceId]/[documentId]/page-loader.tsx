'use client';

import Loader from '@/components/loader';
import OpenaevScenarioSlug from '@/components/service/openaev-scenarios/[slug]/openaev-scenario-slug';
import { OpenaevScenarioQuery } from '@/components/service/openaev-scenarios/openaev-scenario.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { openaevScenarioQuery } from '@generated/openaevScenarioQuery.graphql';
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
    useQueryLoader<openaevScenarioQuery>(OpenaevScenarioQuery);
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
