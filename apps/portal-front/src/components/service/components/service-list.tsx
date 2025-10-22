import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ServiceListFilterLabel } from '@/components/service/components/header/filter/service-list-filter-label';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
  ServiceListHeader,
} from '@/components/service/components/header/service-list-header';
import ServiceCard from '@/components/service/components/service-card';
import { useServiceContext } from '@/components/service/components/service-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { SettingsContext } from '@/components/settings/env-portal-context';
import useServiceCapability from '@/hooks/useServiceCapability';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

export interface ServiceListProps {
  active: SubscribableResource[];
  draft: SubscribableResource[];
  search: string;
  onSearchChange: (v: string) => void;
  additionalFilters?: ServiceListFilterMap;
}
const ServiceList = ({
  active,
  draft,
  search,
  onSearchChange,
  additionalFilters,
}: ServiceListProps) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const { translationKey, serviceInstance } = useServiceContext();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const { localStorageKey } = useServiceContext();
  const { removeLabels } = useServiceListLocalStorage(localStorageKey);

  const firstResource = draft.length > 0 ? draft[0] : active[0];

  const filters = {
    ...additionalFilters,
    [ServiceListFilterKey.Label]: {
      node: <ServiceListFilterLabel />,
      reset: removeLabels,
    },
  };

  return (
    <div className="flex flex-col gap-xl">
      <ServiceListHeader
        search={search}
        onSearchChange={onSearchChange}
        firstServiceSubscriptionId={firstResource?.subscription?.id}
        filters={filters}
      />
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">
            {t(`${translationKey}.NonActive`)}:
          </div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {draft.map((document) => (
              <ServiceCard
                key={document.id}
                document={document}
                detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
                shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
              />
            ))}
          </ul>
          {active.length > 0 && (
            <div className="txt-category">{t(`${translationKey}.Active`)}:</div>
          )}
        </>
      )}
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {active.map((document) => (
          <ServiceCard
            key={document.id}
            document={document}
            detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
            shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default ServiceList;
