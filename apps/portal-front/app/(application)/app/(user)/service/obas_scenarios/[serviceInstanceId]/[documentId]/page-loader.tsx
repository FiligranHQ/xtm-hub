'use client';

import Loader from '@/components/loader';
import OpenAEVScenarioSlug from '@/components/service/obas-scenarios/[slug]/openAEV-scenario-slug';
import { OpenAEVScenarioQuery } from '@/components/service/obas-scenarios/openAEV-scenario.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { openAEVScenarioQuery } from '@generated/openAEVScenarioQuery.graphql';
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
    useQueryLoader<openAEVScenarioQuery>(OpenAEVScenarioQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: serviceInstance?.id,
  });

  return queryRef && serviceInstance ? (
    <OpenAEVScenarioSlug
      serviceInstance={serviceInstance}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
