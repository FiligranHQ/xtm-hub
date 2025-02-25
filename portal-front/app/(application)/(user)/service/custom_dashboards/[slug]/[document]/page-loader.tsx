'use client';

import Loader from '@/components/loader';
import DashboardSlug from '@/components/service/custom-dashboards/custom-dashboard-view';
import { DocumentQuery } from '@/components/service/document/document.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { documentQuery } from '@generated/documentQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  documentId: string;
  service: serviceByIdQuery$data;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({
  documentId,
  service,
}) => {
  const [queryRef, loadQuery] = useQueryLoader<documentQuery>(DocumentQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: service.id,
  });

  return queryRef && service ? (
    <DashboardSlug
      serviceInstance={service}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
