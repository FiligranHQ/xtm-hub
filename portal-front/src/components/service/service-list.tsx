'use client';

import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import { serviceList_services$key } from '../../../__generated__/serviceList_services.graphql';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';
import {
  ServiceListQuery,
  servicesListFragment,
  subscription,
} from '@/components/service/service.graphql';
import { Button } from 'filigran-ui/servers';
import { useToast } from 'filigran-ui/clients';
import { AddSubscriptionMutation } from '@/components/subcription/subscription.graphql';
import { subscriptionCreateMutation } from '../../../__generated__/subscriptionCreateMutation.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  serviceQuery,
} from '../../../__generated__/serviceQuery.graphql';
import {useTranslations} from "next-intl";
import ServiceCard from "@/components/service/service-card";

interface ServiceProps {
  queryRef: PreloadedQuery<serviceQuery>;
  onUpdate: () => void
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  onUpdate
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const queryData = usePreloadedQuery<serviceQuery>(ServiceListQuery, queryRef);
  const [data, refetch] = useRefetchableFragment<
    serviceQuery,
    serviceList_services$key
  >(servicesListFragment, queryData);

  const connectionID = data?.services?.__id;
  const config = useMemo(
    () => ({
      variables: { connections: [connectionID] },
      subscription,
    }),
    [connectionID]
  );
  useSubscription(config);


  const [commitSubscriptionCreateMutation] =
      useMutation<subscriptionCreateMutation>(AddSubscriptionMutation);

  const addSubscriptionInDb = useCallback(
      (service: serviceList_fragment$data) => {
        const handleSuccess = (message: string) => {
          toast({
            title: 'Success',
            description: <>{message}</>,
          });
        };
        const handleError = (error: Error) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: <>{error.message}</>,
          });
        };

        const commitMutation = (status: string, successMessage: string) => {
          commitSubscriptionCreateMutation({
            variables: {
              service_id: service.id,
              connections: [connectionID],
            },
            onCompleted: () => {
              handleSuccess(successMessage);
              onUpdate();
            },
            onError: (error: Error) => handleError(error),
          });
        };

        if (service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT') {
          commitMutation(
              'ACCEPTED',
              t('Service.SubscribeSuccessful')
          );
        } else {
          commitMutation(
              'REQUESTED',
              t('Service.SubscriptionRequestSuccessful')
          );
        }
      },
      [connectionID]
  );

  const servicesData = data.services.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  return (
    <>
      <h2 className="pb-m pt-m">{t('HomePage.AvailableServices')}</h2>
      {data.services.edges.length > 0 ? (
        <React.Suspense
          >
          <ul
              className={'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'}>
            {servicesData.map((service: serviceList_fragment$data) => {
              return (
                  (!service.subscribed) && <ServiceCard bottomLeftAction={
                    service.subscribed ||
                      service.type === 'COMMUNITY' ? null : (
                          <AlertDialogComponent
                              AlertTitle={`${t('Service.SubscribeService')} ${service.name}`}
                              actionButtonText={t('Utils.Continue')}
                              triggerElement={
                                <Button
                                    aria-label="Subscribe service"
                                >
                                  {t('Service.Subscribe')}
                                </Button>
                              }
                              onClickContinue={() => addSubscriptionInDb(service)}>
                            {t('Service.SureWantSubscriptionDirect')}
                          </AlertDialogComponent>
                      )} service={
                  service
                  } />
              );
            })}
          </ul>

        </React.Suspense>
      ) : (
        t('Service.NoService')
      )}
    </>
  );
};

export default ServiceList;