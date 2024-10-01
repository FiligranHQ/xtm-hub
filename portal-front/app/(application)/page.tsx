'use client';

import * as React from 'react';
import { useQueryLoader } from 'react-relay';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';

import { useLocalStorage } from 'usehooks-ts';
import { userServiceOwnedQuery } from '../../__generated__/userServiceOwnedQuery.graphql';
import { UserServiceOwnedQuery } from '@/components/service/user_service.graphql';
import OwnedServices from '@/components/service/home/owned-services';
import {OrderingMode, ServiceOrdering, serviceQuery} from "../../__generated__/serviceQuery.graphql";
import {ServiceListQuery} from "@/components/service/service.graphql";
import ServiceList from "@/components/service/service-list";
import {useTranslations} from "next-intl";
import {useCallback} from "react";

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const [count, setCount] = useLocalStorage('countServiceOwned', 50);
  const [orderMode, setOrderMode] = useLocalStorage(
    'orderModeServiceOwned',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage(
    'orderByServiceOwned',
    'service_name'
  );
  const [queryRef, loadQuery] = useQueryLoader<userServiceOwnedQuery>(
    UserServiceOwnedQuery
  );
  useMountingLoader(loadQuery, { count, orderBy, orderMode });

  const handleUpdate = useCallback(() => {
    loadQuery({
      count,
      orderBy: "service_name",
      orderMode: "asc",
    },
        { fetchPolicy: 'network-only' });
  }, []);

  const [countServiceList, setCountServiceList] = useLocalStorage('countServiceList', 50);
  const [orderModeServiceList, setOrderModeServiceList] = useLocalStorage<OrderingMode>(
      'orderModeServiceList',
      'asc'
  );
  const [orderByServiceList, setOrderByServiceList] = useLocalStorage<ServiceOrdering>(
      'orderByServiceList',
      'name'
  );

  const [queryRefServiceList, loadQueryServiceList] = useQueryLoader<serviceQuery>(ServiceListQuery);
  useMountingLoader(loadQueryServiceList, { count: countServiceList, orderBy: orderByServiceList,orderMode: orderModeServiceList });

  const t = useTranslations('HomePage');


  return <><h1 className="mb-l">{t('Homepage')}</h1> {queryRef ? <OwnedServices queryRef={queryRef} /> : <Loader />}
    {queryRefServiceList ? (
      <ServiceList
          queryRef={queryRefServiceList}
          onUpdate={handleUpdate}
      />
  ) : (
      'Loading...'
  )}
  </>
};

// Component export
export default Page;
