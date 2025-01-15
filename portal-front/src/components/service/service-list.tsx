'use client';

import {
  publicServiceListFragment,
  publicServiceListQuery,
} from '@/components/service/public-service.graphql';
import ServiceCard from '@/components/service/service-card';
import { JOIN_TYPE } from '@/components/service/service.const';
import { subscription } from '@/components/service/service.graphql';
import { AddSubscriptionMutation } from '@/components/subcription/subscription.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  useRefetchableFragment,
  useSubscription,
} from 'react-relay';
import { publicServiceList_services$key } from '../../../__generated__/publicServiceList_services.graphql';
import { publicServiceQuery } from '../../../__generated__/publicServiceQuery.graphql';
import { serviceList_fragment$data } from '../../../__generated__/serviceList_fragment.graphql';
import { subscriptionCreateMutation } from '../../../__generated__/subscriptionCreateMutation.graphql';

interface ServiceProps {
  queryRef: PreloadedQuery<publicServiceQuery>;
  onUpdate: () => void;
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({
  queryRef,
  onUpdate,
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const queryData = usePreloadedQuery<publicServiceQuery>(
    publicServiceListQuery,
    queryRef
  );
  const [data] = useRefetchableFragment<
    publicServiceQuery,
    publicServiceList_services$key
  >(publicServiceListFragment, queryData);

  const connectionID = data?.publicServices?.__id;
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
          title: t('Utils.Success'),
          description: <>{message}</>,
        });
      };
      const handleError = (error: Error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${error.message}`)}</>,
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

      if (service.join_type === JOIN_TYPE.JOIN_SELF) {
        commitMutation('ACCEPTED', t('Service.SubscribeSuccessful'));
      } else {
        commitMutation('REQUESTED', t('Service.SubscriptionRequestSuccessful'));
      }
    },
    [connectionID]
  );

  const servicesData = data.publicServices.edges.map(
    ({ node }) => node
  ) as serviceList_fragment$data[];

  return (
    <>
      {data.publicServices.edges.length > 0 && (
        <React.Suspense>
          <h2 className="pb-m pt-m">{t('HomePage.AvailableServices')}</h2>
          <ul
            className={
              'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
            }>
            {servicesData.map((service: serviceList_fragment$data) => {
              return (
                !service.subscribed && (
                  <ServiceCard
                    key={service.id}
                    bottomLeftAction={
                      service.subscribed ||
                      service.type === 'COMMUNITY' ||
                      !service.public ||
                      service.join_type !== JOIN_TYPE.JOIN_SELF ? null : (
                        <AlertDialogComponent
                          AlertTitle={`${t('Service.SubscribeService')} ${service.name}`}
                          actionButtonText={t('Utils.Continue')}
                          triggerElement={
                            <Button onClick={(e) => e.stopPropagation()}>
                              {t('Service.Subscribe')}
                            </Button>
                          }
                          onClickContinue={() => addSubscriptionInDb(service)}>
                          {t('Service.SureWantSubscriptionDirect')}
                        </AlertDialogComponent>
                      )
                    }
                    service={service}
                  />
                )
              );
            })}
          </ul>
        </React.Suspense>
      )}
    </>
  );
};

export default ServiceList;
