'use client';

import Loader from '@/components/Loader';
import ServiceSlug from '@/components/service/[slug]/ServiceSlug';

import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/use-mounting-loader';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import { ServiceInstanceOrderingEnum } from '@generated/models/ServiceInstanceOrdering.enum';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import { useQueryLoader } from 'react-relay';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader = ({ id }: PreloaderProps) => {
  const [queryRef, loadQuery] =
    useQueryLoader<serviceByIdWithSubscriptionsQuery>(
      ServiceByIdWithSubscriptions
    );
  useMountingLoader(loadQuery, {
    count: 50,
    orderBy: ServiceInstanceOrderingEnum.ORDERING,
    orderMode: OrderingModeEnum.ASC,
    filters: [
      {
        key: ServiceInstanceFilterKeyEnum.ID,
        value: [id],
      },
    ],
  });

  return (
    <>
      {queryRef ? (
        <ServiceSlug
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
