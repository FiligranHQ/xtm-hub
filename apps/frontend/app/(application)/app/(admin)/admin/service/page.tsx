'use client';
import AdminServiceTab, {
  ADMIN_SERVICE_TAB_SERVICE_DEFINITION_IDENTIFIERS,
} from '@/components/service/AdminServiceTab';
import {
  ServiceListQuery,
  servicesListFragment,
} from '@/components/service/service.graphql';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceFilterKeyEnum } from '@generated/models/ServiceInstanceFilterKey.enum';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';
import { useTranslations } from 'next-intl';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

const breadcrumbValue = [
  {
    label: 'MenuLinks.Settings',
  },
  {
    label: 'MenuLinks.Service',
  },
];

const Page = () => {
  const t = useTranslations();

  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  const isCustomViewsEnabled = useIsFeatureEnabled(
    FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS
  );
  const serviceDefinitionIdentifiers =
    ADMIN_SERVICE_TAB_SERVICE_DEFINITION_IDENTIFIERS.filter(
      (value) =>
        isCustomViewsEnabled ||
        value !== ServiceDefinitionIdentifierEnum.OPENCTI_CUSTOM_VIEWS
    );

  const queryData = useLazyLoadQuery<serviceQuery>(ServiceListQuery, {
    count: 50,
    orderBy: 'name',
    orderMode: 'asc',
    searchTerm: '',
    filters: [
      {
        key: ServiceInstanceFilterKeyEnum.SERVICE_DEFINITION_IDENTIFIER,
        value: serviceDefinitionIdentifiers,
      },
    ],
  });
  const [data, refetch] = useRefetchableFragment<
    serviceQuery,
    servicesList_services$key
  >(servicesListFragment, queryData);
  const serviceData = data?.serviceInstances?.edges.map(
    (service) => service?.node as serviceList_fragment$data
  );
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.Service')}</h1>
      <AdminServiceTab
        serviceData={serviceData}
        refetch={refetch}
      />
    </>
  );
};

export default Page;
