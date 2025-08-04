'use client';

import Loader from '@/components/loader';
import DashboardDetails from '@/components/service/custom-dashboards/[slug]/custom-dashboard-details';
import { CustomDashboardQuery } from '@/components/service/custom-dashboards/custom-dashboard.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { customDashboardQuery } from '@generated/customDashboardQuery.graphql';
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
