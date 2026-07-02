import { findLogoUrl } from '@/components/homepage/Homepage.utils';
import HomepageResourceCard from '@/components/homepage/HomepageResourceCard';
import type { PublicLocale } from '@/i18n/config';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  SHAREABLE_RESOURCE_LIBRARY_MAPPING,
  SHAREABLE_RESOURCE_PRODUCT_MAPPING,
  SHAREABLE_RESOURCE_SERVICE_DEFINITION_IDENTIFIER_MAPPING,
  SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { HomepageDocumentFragment } from '@graphql/generated';

type HomepageResourceListProps = {
  title: string;
  locale: PublicLocale;
  documents: HomepageDocumentFragment[];
  isAuthenticated?: boolean;
};

const HomepageResourceList = ({
  title,
  locale,
  documents,
  isAuthenticated = false,
}: HomepageResourceListProps) => {
  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-l">
      <h2 className="text-xl leading-tight">{title}</h2>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-l">
        {documents.map((resource) => {
          const resourceType = resource.type as ShareableResourceType;
          const serviceSlug =
            SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING[resourceType];
          if (!serviceSlug || !resource.slug) return null;

          const url =
            isAuthenticated && resource.service_instance_id
              ? `/app/service/${SHAREABLE_RESOURCE_SERVICE_DEFINITION_IDENTIFIER_MAPPING[resourceType]}/${resource.service_instance_id}/${resource.id}`
              : `/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceSlug}/${resource.slug}`;
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

export default HomepageResourceList;
