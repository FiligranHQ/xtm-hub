import { ServiceListFilterLabel } from '@/components/service/components/header/filter/ServiceListFilterLabel';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
  ServiceListHeader,
} from '@/components/service/components/header/ServiceListHeader';
import ServiceListHeaderButtons from '@/components/service/components/header/ServiceListHeaderButtons';
import ServiceCard from '@/components/service/components/ServiceCard';
import { useServiceContext } from '@/components/service/components/ServiceContext';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import {
  getHeroSectionLibraryProps,
  HeroSectionLibrary,
} from '@/components/service/document/ui/HeroSectionLibrary';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { useUserHasPortalCapability } from '@/hooks/use-portal-capability';
import useScrollPosition from '@/hooks/use-scroll-position';
import useServiceCapability from '@/hooks/use-service-capability';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import {
  IntegrationType,
  PortalCapability,
  ServiceRestriction,
} from '@graphql/generated';
import { Fragment, useContext, useLayoutEffect } from 'react';

import { useTranslate } from '@tolgee/react';
export interface ServiceListProps {
  active: documentItem_fragment$data[];
  draft: documentItem_fragment$data[];
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
  const { t } = useTranslate();
  const { settings } = useContext(SettingsContext);
  const { translationKey, serviceInstance, type } = useServiceContext();
  const userCanUpdate = useServiceCapability(
    ServiceRestriction.Upload,
    serviceInstance
  );
  const userIsMarketingOrBypass = useUserHasPortalCapability([
    PortalCapability.ModifyServiceMetadata,
    PortalCapability.Bypass,
  ]);

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { removeLabels } = useServiceListLocalStorage(localStorageKey);

  const filters = {
    ...additionalFilters,
    [ServiceListFilterKey.Label]: {
      node: <ServiceListFilterLabel type={type} />,
      reset: removeLabels,
    },
  };

  const { restore } = useScrollPosition();
  useLayoutEffect(() => {
    restore();
  }, [restore]);

  const activeByIntegrationType = active.reduce<
    Record<string, documentItem_fragment$data[]>
  >((acc, resource) => {
    const type = resource.integration_type
      ? resource.integration_type
      : resource.type;

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(resource);
    return acc;
  }, {});
  const heroSectionProps = getHeroSectionLibraryProps(serviceInstance, t);

  return (
    <div className="flex flex-col gap-xl">
      <HeroSectionLibrary
        {...heroSectionProps}
        showLibraryUpdate={userIsMarketingOrBypass}
      />
      <ServiceListHeader
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        actions={<ServiceListHeaderButtons />}
        paginationControls={paginationControls}
      />
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">
            {t(`${translationKey}_NonActive`)}:
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
            <div className="txt-category">{t(`${translationKey}_Active`)}:</div>
          )}
        </>
      )}

      {Object.entries(activeByIntegrationType).map(
        ([integrationType, documents]) => (
          <Fragment key={integrationType}>
            {Object.values(IntegrationType).includes(
              integrationType as IntegrationType
            ) && (
              <h2>
                {t(`Service_OpenctiIntegrations_Type_${integrationType}`)}
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
          </Fragment>
        )
      )}
    </div>
  );
};

export default ServiceList;
