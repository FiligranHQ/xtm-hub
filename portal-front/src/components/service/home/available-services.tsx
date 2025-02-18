'use client';

import GuardCapacityComponent from '@/components/admin-guard';
import { Portal, portalContext } from '@/components/me/portal-context';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { RESTRICTION } from '@/utils/constant';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Button, Separator } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { Suspense, useContext } from 'react';
import { useMutation } from 'react-relay';
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
  const { me } = useContext<Portal>(portalContext);

  const [userServiceJoin] = useMutation(UserServiceCreateMutation);

  const getAction = (service: serviceList_fragment$data) => {
    if (
      !service.user_joined &&
      service.organization_subscribed &&
      [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(
        service.join_type ?? ''
      )
    ) {
      return (
        <Button
          onClick={() => {
            userServiceJoin({
              variables: {
                input: {
                  email: me?.email,
                  serviceInstanceId: service.id,
                  organizationId: me?.selected_organization_id,
                },
              },
            });
          }}>
          {t('Service.Join')}
        </Button>
      );
    }
    return (
      !service.organization_subscribed &&
      service.join_type &&
      [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(
        service.join_type
      ) && (
        <GuardCapacityComponent
          capacityRestriction={[RESTRICTION.CAPABILITY_FRT_SERVICE_SUBSCRIBER]}>
          <AlertDialogComponent
            AlertTitle={`${t('Service.SubscribeService')} ${service.name}`}
            actionButtonText={t('Utils.Continue')}
            triggerElement={
              <Button
                size="sm"
                onClick={(e) => e.stopPropagation()}>
                {t('Service.Subscribe')}
              </Button>
            }
            onClickContinue={() => addSubscriptionInDb(service)}>
            {t('Service.SureWantSubscriptionDirect')}
          </AlertDialogComponent>
        </GuardCapacityComponent>
      )
    );
  };

  if (services.length > 0)
    return (
      <Suspense>
        <Separator className="my-12" />
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-xxl'
          }>
          {services.map((service) => {
            return (
              !service.user_joined && (
                <ServiceInstanceCard
                  key={service.id}
                  rightAction={getAction(service)}
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
