import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { APP_PATH } from '@/utils/path/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageLoader from './page-loader';

interface ServiceCustomViewsPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = async ({ params }: ServiceCustomViewsPageProps) => {
  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  if (!(await isFeatureEnabled(FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS))) {
    notFound();
  }

  const { serviceInstanceId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);
  const t = await getTranslations();
  const response = await serverFetchGraphQL<serviceByIdQuery>(
    ServiceByIdQuery,
    {
      service_instance_id: decodedServiceInstanceId,
    }
  );

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label:
        (
          response?.data
            .serviceInstanceByIdAndGrantAccess as unknown as serviceInstance_fragment$data
        )?.name ?? '',
      original: true,
    },
  ];

  return (
    <>
      {response ? (
        <>
          <BreadcrumbNav value={breadcrumbs} />
          <PageLoader
            serviceInstance={
              response.data
                .serviceInstanceByIdAndGrantAccess as unknown as serviceInstance_fragment$data
            }
          />
        </>
      ) : (
        <h1>{t('Utils.ServiceNotFound')}</h1>
      )}
    </>
  );
};

export default Page;
