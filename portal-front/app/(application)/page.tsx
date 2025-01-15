'use client';

import Loader from '@/components/loader';
import useMountingLoader from '@/hooks/useMountingLoader';
import * as React from 'react';
import { useQueryLoader } from 'react-relay';

import { portalContext } from '@/components/me/portal-context';
import { EmptyServices } from '@/components/service/home/empty-services';
import OwnedServices from '@/components/service/home/owned-services';
import { publicServiceListQuery } from '@/components/service/public-service.graphql';
import ServiceList from '@/components/service/service-list';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import { useTranslations } from 'next-intl';
import { useCallback, useContext } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import {
  OrderingMode,
  publicServiceQuery,
  ServiceOrdering,
} from '../../__generated__/publicServiceQuery.graphql';
import { userServiceOwnedQuery } from '../../__generated__/userServiceOwnedQuery.graphql';

export const dynamic = 'force-dynamic';

// Component
const Page: React.FunctionComponent = () => {
  const { isPersonalSpace } = useContext(portalContext);
  if (isPersonalSpace) {
    return <EmptyServices />;
  }
  const [count] = useLocalStorage('countServiceOwned', 50);
  const [orderMode] = useLocalStorage('orderModeServiceOwned', 'asc');
  const [orderBy] = useLocalStorage('orderByServiceOwned', 'service_name');
  const [queryRef, loadQuery] = useQueryLoader<userServiceOwnedQuery>(
    UserServiceOwnedQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });

  const handleUpdate = useCallback(() => {
    loadQuery(
      {
        count,
        orderBy: 'service_name',
        orderMode: 'asc',
      },
      { fetchPolicy: 'network-only' }
    );
  }, []);

  const [countServiceList] = useLocalStorage('countServiceList', 50);
  const [orderModeServiceList] = useLocalStorage<OrderingMode>(
    'orderModeServiceList',
    'asc'
  );
  const [orderByServiceList] = useLocalStorage<ServiceOrdering>(
    'orderByServiceList',
    'name'
  );

  const [queryRefServiceList, loadQueryServiceList] =
    useQueryLoader<publicServiceQuery>(publicServiceListQuery);

  useMountingLoader(loadQueryServiceList, {
    count: countServiceList,
    orderBy: orderByServiceList,
    orderMode: orderModeServiceList,
  });

  const t = useTranslations();

  return (
    <>
      <h1 className="mb-l">{t('HomePage.Homepage')}</h1>{' '}
      {queryRef ? <OwnedServices queryRef={queryRef} /> : <Loader />}
      {queryRefServiceList ? (
        <ServiceList
          queryRef={queryRefServiceList}
          onUpdate={handleUpdate}
        />
      ) : (
        <>{t('Utils.Loading')}</>
      )}
    </>
  );
};

// Component export
export default Page;
