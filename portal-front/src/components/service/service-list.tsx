'use client';

import * as React from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
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
import {ServiceTypeBadge} from "@/components/ui/service-type-badge";
import {useTranslations} from "next-intl";

interface ServiceProps {
  queryRef: PreloadedQuery<serviceQuery>;
  onUpdate: () => void
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  onUpdate
}) => {

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
  const { toast } = useToast();
  const [commitSubscriptionCreateMutation] =
    useMutation<subscriptionCreateMutation>(AddSubscriptionMutation);
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return;
  }
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

  const generateAlertText = (service: serviceList_fragment$data) => {
    return service.subscription_service_type === 'SUBSCRIPTABLE_DIRECT'
      ? t('Service.SureWantSubscriptionDirect')
      : t('Service.SureWantSubscriptionUndirect');
  };


  const servicesData = data.services.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  const t = useTranslations();
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
                  (!service.subscribed) && <li
                      className="border-light flex flex-col rounded border bg-page-background p-s"
                      key={service.id}>
                    <div className="flex-1 p-m pb-xl flex justify-between items-center gap-s">
                      <h3>{service.name}</h3>{' '}

                      {service.subscribed ||
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
                        {generateAlertText(service)}
                      </AlertDialogComponent>
                      )}

                    </div>
                    <p className={'p-m pb-xl pt-s txt-sub-content'}>
                      {service.description}
                    </p>
                    <ul className="flex justify-between items-center p-s gap-s flex-row">
                      <li>
                        <ServiceTypeBadge
                            type={service.type as ServiceTypeBadge}
                        />
                      </li>

                    </ul>
                  </li>
              );
            })}
          </ul>

        </React.Suspense>
      ) : (
        'There is no service... Yet !'
      )}
    </>
  );
};

export default ServiceList;