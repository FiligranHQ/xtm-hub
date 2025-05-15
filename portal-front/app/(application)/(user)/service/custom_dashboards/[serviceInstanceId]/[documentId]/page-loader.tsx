'use client';

import Loader from '@/components/loader';
import DashboardDetails from '@/components/service/custom-dashboards/[documentId]/custom-dashboard-details';
import { CustomDashboardQuery } from '@/components/service/custom-dashboards/custom-dashboard.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { customDashboardQuery } from '@generated/customDashboardQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
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
  const [queryRef, loadQuery] =
    useQueryLoader<customDashboardQuery>(CustomDashboardQuery);
  useMountingLoader(loadQuery, {
    documentId,
    serviceInstanceId: service?.id,
  });

  return queryRef && service ? (
    <DashboardDetails
      serviceInstance={service}
      queryRef={queryRef}
    />
  ) : (
    <Loader />
  );
};

// Component export
export default PageLoader;
