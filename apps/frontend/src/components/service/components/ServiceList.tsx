import IntegrationAccordion from '@/components/ui/shareable-resource/IntegrationAccordion';
import {
  IntegrationType,
  PortalCapability,
  ServiceRestriction,
} from '@graphql/generated';

import DocumentList from '@/components/service/components/DocumentList';
import { ServiceListFilterLabel } from '@/components/service/components/header/filter/ServiceListFilterLabel';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
  ServiceListHeader,
} from '@/components/service/components/header/ServiceListHeader';
import ServiceListHeaderButtons from '@/components/service/components/header/ServiceListHeaderButtons';
import { useServiceContext } from '@/components/service/components/ServiceContext';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import {
  getHeroSectionLibraryProps,
  HeroSectionLibrary,
} from '@/components/service/document/ui/HeroSectionLibrary';
import { useUserHasPortalCapability } from '@/hooks/use-portal-capability';
import useScrollPosition from '@/hooks/use-scroll-position';
import useServiceCapability from '@/hooks/use-service-capability';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { Fragment, useLayoutEffect } from 'react';

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
  const t = useTranslations();
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
  const {
    removeLabels,
    displayMode: selectedDisplayMode,
    setDisplayMode,
  } = useServiceListLocalStorage(localStorageKey);

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
      <div className="sticky top-0 py-m z-11 relative bg-gradient-background">
        <ServiceListHeader
          search={search}
          onSearchChange={onSearchChange}
          filters={filters}
          actions={<ServiceListHeaderButtons />}
          paginationControls={paginationControls}
          onDisplayModeChange={setDisplayMode}
        />
      </div>
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">
            {t(`${translationKey}.NonActive`)}:
          </div>
          <DocumentList
            documents={draft}
            displayMode={selectedDisplayMode}
            connectionId={connectionId}
          />
          {active.length > 0 && (
            <div className="txt-category">{t(`${translationKey}.Active`)}:</div>
          )}
        </>
      )}

      {Object.entries(activeByIntegrationType).map(
        ([integrationType, documents]) => (
          <Fragment key={integrationType}>
            {Object.values(IntegrationType).includes(
              integrationType as IntegrationType
            ) ? (
              <IntegrationAccordion
                integrationType={integrationType}>
                <DocumentList
                  documents={documents}
                  displayMode={selectedDisplayMode}
                  connectionId={connectionId}
                />
              </IntegrationAccordion>
            ) : (
              <DocumentList
                displayMode={selectedDisplayMode}
                documents={documents}
                connectionId={connectionId}
              />
            )}
          </Fragment>
        )
      )}
    </div>
  );
};

export default ServiceList;
