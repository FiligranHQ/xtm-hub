'use client';
import { ServiceListHeader } from '@/components/service/components/header/service-list-header';
import { AppServiceListLocalStorageKeyContext } from '@/components/service/components/service-list-local-storage-key-context';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import ShareableResourceConnectorCard from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import { RelayProvider } from '@/relay/RelayProvider';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  isConnectorResource,
  SeoResource,
  ServiceSlug,
} from '@/utils/shareable-resources/shareable-resources.types';
import { useShareableResourceMapping } from '@/utils/shareable-resources/use-shareable-resource-mapping';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import React from 'react';

interface Props {
  serviceInstance: seoServiceInstanceFragment$data;
  documents: SeoResource[];
  baseUrl: string;
  jsonLd: Record<string, unknown>;
}

export const PageLoader: React.FC<Props> = ({
  serviceInstance,
  documents,
  baseUrl,
  jsonLd,
}) => {
  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: serviceInstance.name,
      original: true,
    },
  ];

  const { filters, localStorageKey } = useShareableResourceMapping(
    serviceInstance.slug as ServiceSlug
  );

  return (
    <RelayProvider>
      <AppServiceListLocalStorageKeyContext localStorageKey={localStorageKey}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <BreadcrumbNav value={breadcrumbValue} />

        <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
          {serviceInstance.name}
        </h1>

        {documents.length === 0 ? (
          <div className="my-4 text-center">No document found</div>
        ) : (
          <>
            <ServiceListHeader
              search={''}
              onSearchChange={() => {}}
              filters={filters}
            />
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-l">
              {documents.map((document) => {
                if (isConnectorResource(document)) {
                  return (
                    <ShareableResourceConnectorCard
                      key={document.id}
                      shareableConnector={document}
                      serviceInstance={serviceInstance}
                      detailUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance?.slug}/${document?.slug}`}
                      shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance?.slug}/${document?.slug}`}
                    />
                  );
                }
                return (
                  <ShareableResourceCard
                    key={document.id}
                    document={document}
                    detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                    shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                    serviceInstance={serviceInstance}
                  />
                );
              })}
            </ul>
          </>
        )}
      </AppServiceListLocalStorageKeyContext>
    </RelayProvider>
  );
};
