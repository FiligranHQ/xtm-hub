import PublicServiceInstanceCard from '@/components/service/PublicServiceInstanceCard';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { getTranslations } from 'next-intl/server';

const Page = async () => {
  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery,
    {},
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const isCustomViewsEnabled = await isFeatureEnabled(
    FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS
  );
  const services = (
    response.data
      .seoServiceInstances as unknown as seoServiceInstanceFragment$data[]
  ).filter(
    (service) =>
      isCustomViewsEnabled ||
      service?.service_definition?.identifier !==
        ServiceDefinitionIdentifierEnum.OPENCTI_CUSTOM_VIEWS
  );

  const t = await getTranslations();
  return (
    <>
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        {t('PublicHomePage.Title')}
      </h1>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l'
        }>
        {services.map((service) => (
          <PublicServiceInstanceCard
            key={service.id}
            serviceInstance={seoServiceInstanceToInstanceCardData(service, t)}
          />
        ))}
      </ul>
    </>
  );
};

export default Page;
