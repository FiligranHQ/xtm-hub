'use client';

import * as React from 'react';
import {useQueryLoader} from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import ServiceSlug from '@/components/service/[slug]/service-slug';
import {useSearchParams} from 'next/navigation';
import {serviceUserSlugQuery} from '../../../../../../__generated__/serviceUserSlugQuery.graphql';
import {ServiceUserSlugQuery} from '@/components/service/service.graphql';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  const searchParams = useSearchParams();
  const count = Number(searchParams.get('count') ?? 50);
  const orderMode = searchParams.get('orderMode') ?? 'asc';
  const orderBy = searchParams.get('orderBy') ?? 'first_name';
  const [queryRef, loadQuery] =
    useQueryLoader<serviceUserSlugQuery>(ServiceUserSlugQuery);
  useMountingLoader(loadQuery, { id, count, orderBy, orderMode });
  return queryRef ? <ServiceSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
