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
import ServiceListHeaderButtons from '@/components/service/components/header/service-list-header-buttons';
import ServiceCard from '@/components/service/components/service-card';
import { useServiceContext } from '@/components/service/components/service-context';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { useServiceListLocalStorage } from '@/components/service/components/use-service-list-local-storage';
import { SettingsContext } from '@/components/settings/env-portal-context';
import useServiceCapability from '@/hooks/useServiceCapability';
import {
  isIntegrationItem,
  SubscribableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useLayoutEffect } from 'react';
import { useSessionStorage } from 'usehooks-ts';

export interface ServiceListProps {
  active: SubscribableResource[];
  draft: SubscribableResource[];
  search: string;
  onSearchChange: (v: string) => void;
  additionalFilters?: ServiceListFilterMap;
  connectionId?: string;
  paginationControls?: React.ReactNode;
}
const ServiceList = ({
  active,
  draft,
  search,
  onSearchChange,
  additionalFilters,
  connectionId,
  paginationControls,
}: ServiceListProps) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const { translationKey, serviceInstance, type } = useServiceContext();
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { removeLabels } = useServiceListLocalStorage(localStorageKey);

  const firstResource = draft.length > 0 ? draft[0] : active[0];

  const filters = {
    ...additionalFilters,
    [ServiceListFilterKey.Label]: {
      node: <ServiceListFilterLabel type={type} />,
      reset: removeLabels,
    },
  };

  const [scrollPosition] = useSessionStorage('scrollPosition', {
    container: 'main',
    position: 0,
  });
  useLayoutEffect(() => {
    if (scrollPosition.position > 0) {
      if (scrollPosition.container === 'main') {
        const el = window.document.querySelector('main');
        if (!el) return;
        el.scrollTo({
          top: scrollPosition.position,
          behavior: 'auto',
        });
      } else {
        window.scrollTo({
          top: scrollPosition.position,
          behavior: 'auto',
        });
      }
    }
  }, []);

  const activeByIntegrationType = active.reduce<
    Record<string, SubscribableResource[]>
  >((acc, resource) => {
    const type =
      isIntegrationItem(resource) && resource.integration_type
        ? resource.integration_type
        : resource.type;

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(resource);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-xl">
      <h1>{serviceInstance.name}</h1>
      <ServiceListHeader
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        actions={
          <ServiceListHeaderButtons
            firstServiceSubscriptionId={firstResource?.subscription?.id ?? ''}
          />
        }
        paginationControls={paginationControls}
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
                connectionId={connectionId}
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

      {Object.entries(activeByIntegrationType).map(
        ([integrationType, documents]) => (
          <>
            {Object.values(IntegrationTypeEnum).includes(
              integrationType as IntegrationTypeEnum
            ) && (
              <h2>
                {t(`Service.OpenctiIntegrations.Type.${integrationType}`)}
              </h2>
            )}
            <ul
              className={
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
              }>
              {documents.map((document) => (
                <ServiceCard
                  key={document.id}
                  document={document}
                  detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
                  shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                />
              ))}
            </ul>
          </>
        )
      )}
    </div>
  );
};

export default ServiceList;
