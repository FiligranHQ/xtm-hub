'use client';

import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { Button, Separator } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { serviceList_fragment$data } from '../../../../__generated__/serviceList_fragment.graphql';
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
    return service.subscribed ||
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
    );
  };

  if (services.length > 0)
    return (
      <Suspense>
        <Separator className="my-4" />
        <ul
          className={
            'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
          }>
          {services.map((service) => {
            return (
              !service.subscribed && (
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
