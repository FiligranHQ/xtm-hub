import HomepageResourceCard from '@/components/homepage/HomepageResourceCard';
import type { PublicLocale } from '@/i18n/config';
import { portalGraphqlClientCached } from '@/lib/graphql-client';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  SHAREABLE_RESOURCE_LIBRARY_MAPPING,
  SHAREABLE_RESOURCE_PRODUCT_MAPPING,
  SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import {
  DocumentImageType,
  MostDeployedDocumentsQueryQuery,
  useMostDeployedDocumentsQueryQuery,
} from '@graphql/generated';
import { getTranslations } from 'next-intl/server';

const MOST_DEPLOYED_LIMIT = 4;

type MostDeployedDocument =
  MostDeployedDocumentsQueryQuery['mostDeployedDocuments'][number];

const findLogoUrl = (resource: MostDeployedDocument): string | undefined => {
  const logo = resource.children_documents?.find(
    (doc) => doc.image_type === DocumentImageType.Logo
  );
  return logo && resource.service_instance_id
    ? `/document/images/${resource.service_instance_id}/${logo.id}`
    : undefined;
};

const MostDeployedResources = async ({ locale }: { locale: PublicLocale }) => {
  const t = await getTranslations('PublicHomePage.XtmMostDeployedResources');

  const data = await useMostDeployedDocumentsQueryQuery.fetcher(
    portalGraphqlClientCached,
    { limit: MOST_DEPLOYED_LIMIT }
  )();

  const resources = data.mostDeployedDocuments;

  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-l mt-xl">
      <h2 className="text-xl leading-tight">{t('Title')}</h2>
      <ul className="grid grid-cols-4 gap-l">
        {resources.map((resource) => {
          const resourceType = resource.type as ShareableResourceType;
          const serviceSlug =
            SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING[resourceType];
          if (!serviceSlug || !resource.slug) return null;

          const url = `/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceSlug}/${resource.slug}`;
          const footerTags = [
            SHAREABLE_RESOURCE_PRODUCT_MAPPING[resourceType],
            SHAREABLE_RESOURCE_LIBRARY_MAPPING[resourceType],
          ];

          const logoUrl = findLogoUrl(resource);

          const verified =
            docHasMetadata(resource, 'verified') && Boolean(resource.verified);
          const deployable =
            docHasMetadata(resource, 'manager_supported') &&
            Boolean(resource.manager_supported);

          const active =
            resource.active &&
            resource.type !== ShareableResourceType.OPENCTI_INTEGRATION;

          return (
            <li key={resource.id}>
              <HomepageResourceCard
                key={resource.id}
                name={resource.name ?? ''}
                shortDescription={resource.short_description}
                url={url}
                logoUrl={logoUrl}
                active={active}
                verified={verified}
                deployable={deployable}
                useCases={
                  resource.use_cases?.map((uc) => ({
                    id: uc.id,
                    name: uc.name,
                  })) ?? []
                }
                footerTags={footerTags}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default MostDeployedResources;
