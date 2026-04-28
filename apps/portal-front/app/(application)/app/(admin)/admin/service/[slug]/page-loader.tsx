'use client';

import Loader from '../../../../../../../src/components/Loader';
import ServiceSlug from '../../../../../../../src/components/service/[slug]/ServiceSlug';

import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '../../../../../../../src/hooks/use-mounting-loader';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
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
