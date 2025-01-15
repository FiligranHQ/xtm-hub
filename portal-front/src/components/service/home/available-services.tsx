'use client';

import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import ServiceCard from '../service-card';
import { JOIN_TYPE, PublicService } from '../service.const';

interface PublicServicesProps {
  services: PublicService[];
  addSubscriptionInDb: (service: PublicService) => void;
}

const AvailableServices = ({
  addSubscriptionInDb,
  services,
}: PublicServicesProps) => {
  const t = useTranslations();
  const getAction = (service: PublicService) => {
    return service.subscribed ||
      service.type === 'COMMUNITY' ||
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
        <h2 className="pb-m pt-m">{t('HomePage.AvailableServices')}</h2>
        <ul
          className={
            'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
          }>
          {services.map((service) => {
            return (
              !service.subscribed && (
                <ServiceCard
                  key={service.id}
                  bottomLeftAction={getAction(service)}
                  service={service}
                  serviceLink={service.links?.[0]?.url}
                />
              )
            );
          })}
        </ul>
      </Suspense>
    );
};

export default AvailableServices;
