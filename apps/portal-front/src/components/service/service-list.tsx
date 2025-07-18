'use client';

import useDecodedQuery from '@/hooks/useDecodedQuery';
import { isExternalService } from '@/utils/services';
import { enrollOCTIInstancesQuery } from '@generated/enrollOCTIInstancesQuery.graphql';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { publicServiceQuery } from '@generated/publicServiceQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServiceOwnedQuery } from '@generated/userServiceOwnedQuery.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { PreloadedQuery } from 'react-relay';
import AvailableServices from './home/available-services';
import HighligthedServices from './home/highlighted-services';
import { useServiceQueries } from './home/hooks/useServiceQueries';
import OwnedServices from './home/owned-services';

interface ServiceProps {
  queryRefUserServiceOwned: PreloadedQuery<userServiceOwnedQuery>;
  queryRefServiceList: PreloadedQuery<publicServiceQuery>;
  queryRefOCTIInstances: PreloadedQuery<enrollOCTIInstancesQuery>;
  onUpdate: () => void;
}

const ServiceList = ({
  queryRefUserServiceOwned,
  queryRefServiceList,
  queryRefOCTIInstances,
  onUpdate,
}: ServiceProps) => {
  const t = useTranslations();
  const { h } = useDecodedQuery();

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

  if (h) {
    toast({
      description: <>{t(`Service.HighlightedServices`)}</>,
    });
  }

  const { ownedServices, publicServices, octiInstances, addSubscriptionInDb } =
    useServiceQueries(
      queryRefUserServiceOwned,
      queryRefServiceList,
      queryRefOCTIInstances,
      onUpdate,
      handleSuccess,
      handleError
    );

  const {
    owned: publicOwnedServices,
    notOwned: availableServices,
    highlighted: publicHighlightedServices,
  } = useMemo(() => {
    return publicServices.reduce(
      (acc, service) => {
        if (service.service_definition?.identifier === h) {
          acc.highlighted.push(service);
        }
        // A service is owned if it is subscribed or if it is an external service
        else if (
          service.organization_subscribed ||
          isExternalService(
            service.service_definition!
              .identifier as ServiceDefinitionIdentifierEnum
          )
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
        highlighted: [] as serviceList_fragment$data[],
      }
    );
  }, [publicServices, h]);

  const {
    regular: regularOwnedServices,
    highlighted: ownedHighlightedServices,
  } = useMemo(() => {
    return ownedServices.reduce(
      (acc, service) => {
        if (
          service.subscription!.service_instance!.service_definition!
            .identifier === h
        ) {
          acc.highlighted.push(service);
        } else {
          acc.regular.push(service);
        }
        return acc;
      },
      {
        regular: [] as userServicesOwned_fragment$data[],
        highlighted: [] as userServicesOwned_fragment$data[],
      }
    );
  }, [ownedServices, h]);

  return (
    <>
      <HighligthedServices
        publicServices={publicHighlightedServices}
        ownedServices={ownedHighlightedServices}
        addSubscriptionInDb={addSubscriptionInDb}
      />
      <AvailableServices
        services={availableServices}
        addSubscriptionInDb={addSubscriptionInDb}
      />
      <OwnedServices
        services={regularOwnedServices}
        publicServices={publicOwnedServices}
        octiInstances={octiInstances}
      />
    </>
  );
};

export default ServiceList;
