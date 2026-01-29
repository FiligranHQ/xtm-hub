import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  isIntegrationItem,
  PublicShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  documents: PublicShareableResource[];
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicShareableResourceList: React.FC<Props> = ({
  documents,
  serviceInstance,
  baseUrl,
}) => {
  const t = useTranslations();

  if (documents.length === 0) {
    return <div className="my-4 text-center">No document found</div>;
  }

  const documentsByIntegrationType = documents.reduce<
    Record<string, PublicShareableResource[]>
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
    <>
      {Object.entries(documentsByIntegrationType).map(
        ([integrationType, documents]) => (
          <>
            {Object.values(IntegrationTypeEnum).includes(
              integrationType as IntegrationTypeEnum
            ) && (
              <h2 className="mt-xl">
                {t(`Service.OpenctiIntegrations.Type.${integrationType}`)}
              </h2>
            )}
            <ul
              className={
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
              }>
              {documents.map((document) => (
                <ShareableResourceCard
                  publicPath
                  key={document.id}
                  document={document}
                  serviceInstance={serviceInstance}
                  detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                  shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                />
              ))}
            </ul>
          </>
        )
      )}
    </>
  );
};
