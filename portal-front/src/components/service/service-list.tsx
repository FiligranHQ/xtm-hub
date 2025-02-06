'use client';

import { publicServiceQuery } from '@generated/publicServiceQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServiceOwnedQuery } from '@generated/userServiceOwnedQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { PreloadedQuery } from 'react-relay';
import AvailableServices from './home/available-services';
import { useServiceQueries } from './home/hooks/useServiceQueries';
import OwnedServices from './home/owned-services';
import { SERVICE_DEFINITION_IDENTIFIER } from './service.const';

interface ServiceProps {
  queryRefUserServiceOwned: PreloadedQuery<userServiceOwnedQuery>;
  queryRefServiceList: PreloadedQuery<publicServiceQuery>;
  onUpdate: () => void;
}

const ServiceList = ({
  queryRefUserServiceOwned,
  queryRefServiceList,
  onUpdate,
}: ServiceProps) => {
  const t = useTranslations();

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

  const { ownedServices, publicServices, addSubscriptionInDb } =
    useServiceQueries(
      queryRefUserServiceOwned,
      queryRefServiceList,
      onUpdate,
      handleSuccess,
      handleError
    );

  const { owned: publicOwnedServices, notOwned: availableServices } =
    useMemo(() => {
      return publicServices.reduce(
        (acc, service) => {
          // A service is owned if it is subscribed or if it is a link service (link service are special ones)
          if (
            (service.organization_subscribed && service.user_subscribed) ||
            service.service_definition?.identifier ===
              SERVICE_DEFINITION_IDENTIFIER.LINK
          ) {
            acc.owned.push(service);
          } else {
            acc.notOwned.push(service);
          }
          return acc;
        },
        {
          owned: [] as serviceList_fragment$data[],
          notOwned: [] as serviceList_fragment$data[],
        }
      );
    }, [publicServices]);

  return (
    <>
      <OwnedServices
        services={ownedServices}
        publicServices={publicOwnedServices}
      />
      <AvailableServices
        services={availableServices}
        addSubscriptionInDb={addSubscriptionInDb}
      />
    </>
  );
};

export default ServiceList;
