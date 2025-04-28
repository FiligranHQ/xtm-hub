'use client';

import Loader from '@/components/loader';
import ServiceSlug from '@/components/service/[slug]/service-slug';

import { ServiceByIdWithSubscriptions } from '@/components/service/service.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import { serviceByIdWithSubscriptionsQuery } from '@generated/serviceByIdWithSubscriptionsQuery.graphql';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

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

  return <>{queryRef ? <ServiceSlug queryRef={queryRef} /> : <Loader />}</>;
};

// Component export
export default PageLoader;
