import ShareableResourceCard from '@/components/ui/shareable-resource/ShareableResourceCard';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { isIntegrationItem } from '@/utils/shareable-resources/shareable-resources.types';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { useLocale, useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';

interface PublicShareableResourceListProps {
  documents: publicDocumentItemFragment$data[];
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicShareableResourceList = ({
  documents,
  serviceInstance,
  baseUrl,
}: PublicShareableResourceListProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const documentsByIntegrationType = useMemo(() => {
    return documents.reduce<Record<string, publicDocumentItemFragment$data[]>>(
      (acc, resource) => {
        const type =
          isIntegrationItem(resource) && resource.integration_type
            ? resource.integration_type
            : resource.type;

        if (!acc[type]) {
          acc[type] = [];
        }

        acc[type].push(resource);
        return acc;
      },
      {}
    );
  }, [documents]);

  if (documents.length === 0) {
    return (
      <div className="my-4 text-center">{t('Utils.DocumentNotFound')}</div>
    );
  }

  return (
    <>
      {Object.entries(documentsByIntegrationType).map(
        ([integrationType, documents]) => (
          <Fragment key={integrationType}>
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
                  detailUrl={`/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                  shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
                />
              ))}
            </ul>
          </Fragment>
        )
      )}
    </>
  );
};
