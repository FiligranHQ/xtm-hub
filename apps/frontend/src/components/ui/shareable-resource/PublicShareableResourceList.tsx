import { CountBadge } from '@/components/ui/CountBadge';
import { PublicShareableDocumentList } from '@/components/ui/shareable-resource/PublicShareableDocumentList';
import { isIntegrationItem } from '@/utils/shareable-resources/shareable-resources.types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@filigran/ui';
import { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { IntegrationType } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo } from 'react';

interface PublicShareableResourceListProps {
  documents: publicDocumentListItemFragment$data[];
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicShareableResourceList = ({
  documents,
  serviceInstance,
  baseUrl,
}: PublicShareableResourceListProps) => {
  const t = useTranslations();

  const documentsByIntegrationType = useMemo(() => {
    return documents.reduce<
      Record<string, publicDocumentListItemFragment$data[]>
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
            {Object.values(IntegrationType).includes(
              integrationType as IntegrationType
            ) ? (
              <Accordion
                type="single"
                collapsible>
                <AccordionItem value={integrationType}>
                  <h2 className="m-0">
                    <AccordionTrigger className="hover:cursor-pointer">
                      <div className="inline-flex items-center gap-s">
                        {t(
                          `Service.OpenctiIntegrations.Type.${integrationType}`
                        )}
                        <CountBadge
                          count={documents.length}
                          bgFadedClass={
                            'bg-feedback-neutral-secondary-transparency'
                          }
                          textClass={'text-feedback-neutral-primary'}
                        />
                      </div>
                    </AccordionTrigger>
                  </h2>

                  <AccordionContent>
                    <PublicShareableDocumentList
                      documents={documents}
                      serviceInstance={serviceInstance}
                      baseUrl={baseUrl}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <PublicShareableDocumentList
                documents={documents}
                serviceInstance={serviceInstance}
                baseUrl={baseUrl}
              />
            )}
          </Fragment>
        )
      )}
    </>
  );
};
