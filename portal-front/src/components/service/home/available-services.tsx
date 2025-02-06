'use client';

import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Button, Separator } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';
import { JOIN_TYPE } from '../service.const';

interface PublicServicesProps {
  services: serviceList_fragment$data[];
  addSubscriptionInDb: (service: serviceList_fragment$data) => void;
}

const AvailableServices = ({
  addSubscriptionInDb,
  services,
}: PublicServicesProps) => {
  const t = useTranslations();
  const getAction = (service: serviceList_fragment$data) => {
    return (
      !service.user_subscribed &&
      service.join_type &&
      [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(
        service.join_type
      ) && (
        <AlertDialogComponent
          AlertTitle={`${t('Service.SubscribeService')} ${service.name}`}
          actionButtonText={t('Utils.Continue')}
          triggerElement={
            <Button
              onClick={(e) => e.stopPropagation()}
              className="h-7 text-xs">
              {t('Service.Subscribe')}
            </Button>
          }
          onClickContinue={() => addSubscriptionInDb(service)}>
          {t('Service.SureWantSubscriptionDirect')}
        </AlertDialogComponent>
      )
    );
  };

  if (services.length > 0)
    return (
      <Suspense>
        <Separator className="my-12" />
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-m'
          }>
          {services.map((service) => {
            return (
              !service.user_subscribed && (
                <ServiceInstanceCard
                  key={service.id}
                  bottomLeftAction={getAction(service)}
                  serviceInstance={service}
                />
              )
            );
          })}
        </ul>
      </Suspense>
    );
};

export default AvailableServices;
