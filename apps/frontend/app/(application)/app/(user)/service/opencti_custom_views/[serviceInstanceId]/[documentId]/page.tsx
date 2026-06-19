import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import { isFeatureEnabled } from '@/utils/settings.service';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageLoader from './page-loader';

interface ServiceCustomViewPageProps {
  params: Promise<{ serviceInstanceId: string; documentId: string }>;
}

const Page = async ({ params }: ServiceCustomViewPageProps) => {
  // TODO: feature flag OPENCTI_CUSTOM_VIEWS - remove with the feature
  if (!(await isFeatureEnabled(FeatureFlagEnum.OPENCTI_CUSTOM_VIEWS))) {
    notFound();
  }

  const { serviceInstanceId, documentId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);
  const decodedDocumentId = decodeURIComponent(documentId);
  const t = await getTranslations();
  const response = await serverFetchGraphQL<serviceByIdQuery>(
    ServiceByIdQuery,
    {
      service_instance_id: decodedServiceInstanceId,
    }
  );

  return (
    <>
      {decodedDocumentId && response ? (
        <PageLoader
          documentId={decodedDocumentId}
          serviceInstance={
            response.data
              .serviceInstanceByIdAndGrantAccess as unknown as serviceInstance_fragment$data
          }
        />
      ) : (
        <h1>{t('Utils.DocumentNotFound')}</h1>
      )}
    </>
  );
};

export default Page;
