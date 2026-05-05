'use client';

import Loader from '@/components/Loader';
import ServiceSlug from '@/components/service/[slug]/ServiceSlug';

import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/use-mounting-loader';
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
  useMountingLoader(loadQuery, { service_instance_id: id });

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
