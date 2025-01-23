'use client';

import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { PreloadedQuery } from 'react-relay';
import { publicServiceQuery } from '../../../__generated__/publicServiceQuery.graphql';
import { userServiceOwnedQuery } from '../../../__generated__/userServiceOwnedQuery.graphql';
import AvailableServices from './home/available-services';
import { useServiceQueries } from './home/hooks/useServiceQueries';
import OwnedServices from './home/owned-services';

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

  // Public services are considered as owned services
  const publicOwnedServices = useMemo(
    () => publicServices.filter((service) => service.public),
    [publicServices]
  );

  // Non-public available services are not owned and can be subscribed
  const availableServices = useMemo(
    () => publicServices.filter((service) => !service.public),
    [publicServices]
  );

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
