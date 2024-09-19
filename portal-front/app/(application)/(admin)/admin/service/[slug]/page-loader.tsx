'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import ServiceSlug from '@/components/service/[slug]/service-slug';
import { SubscriptionsByService } from '@/components/subcription/subscription.graphql';
import { subscriptionByServiceQuery } from '../../../../../../__generated__/subscriptionByServiceQuery.graphql';
import { serviceByIdQuery } from '../../../../../../__generated__/serviceByIdQuery.graphql';
import { ServiceById } from '@/components/service/service.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const [queryRef, loadQuery] = useQueryLoader<subscriptionByServiceQuery>(
    SubscriptionsByService
  );
  useMountingLoader(loadQuery, { service_id: id });

  const [queryRefService, loadQueryService] =
    useQueryLoader<serviceByIdQuery>(ServiceById);
  useMountingLoader(loadQueryService, { service_id: id });

  return (
    <>
      {queryRef && queryRefService ? (
        <ServiceSlug
          queryRefService={queryRefService}
          loadQuery={loadQuery}
          queryRef={queryRef}
          serviceId={id}
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

// Component export
export default PageLoader;
