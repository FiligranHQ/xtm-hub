'use client';

import Loader from '@/components/loader';
import ObasScenarioSlug from '@/components/service/obas-scenarios/[slug]/obas-scenario-slug';
import { ObasScenarioQuery } from '@/components/service/obas-scenarios/obas-scenario.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { obasScenarioQuery } from '@generated/obasScenarioQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  documentId: string;
  service: serviceInstance_fragment$data;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  documentId,
  service,
}) => {
  const [queryRef, loadQuery] =
    useQueryLoader<obasScenarioQuery>(ObasScenarioQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: service?.id,
  });

  return queryRef && service ? (
    <ObasScenarioSlug
      serviceInstance={service}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
