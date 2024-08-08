'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import ServiceSlug from '@/components/service/[slug]/service-slug';
import { serviceUserSlugQuery } from '../../../../../../__generated__/serviceUserSlugQuery.graphql';
import { ServiceUserSlugQuery } from '@/components/service/service.graphql';

// Component interface
interface PreloaderProps {
  id: string;
}

// Component
const PageLoader: React.FunctionComponent<PreloaderProps> = ({ id }) => {
  let count = Number(localStorage.getItem('countServiceSlug'));
  if (!count) {
    localStorage.setItem('countServiceSlug', '50');
    count = 50;
  }
  let orderMode = localStorage.getItem('orderModeServiceSlug');
  if (!orderMode) {
    localStorage.setItem('orderModeServiceSlug', 'asc');
    orderMode = 'asc';
  }

  let orderBy = localStorage.getItem('orderByServiceSlug');
  if (!orderBy) {
    localStorage.setItem('orderByServiceSlug', 'first_name');
    orderBy = 'first_name';
  }
  const [queryRef, loadQuery] =
    useQueryLoader<serviceUserSlugQuery>(ServiceUserSlugQuery);
  useMountingLoader(loadQuery, { id, count, orderBy, orderMode });
  return queryRef ? <ServiceSlug queryRef={queryRef} /> : <Loader />;
};

// Component export
export default PageLoader;
