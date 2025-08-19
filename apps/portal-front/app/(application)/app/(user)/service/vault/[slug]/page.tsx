import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import PageLoader from './page-loader';

interface ServiceVaultPageProps {
  params: Promise<{ slug: string }>;
}
const Page = async ({ params }: ServiceVaultPageProps) => {
  const { slug } = await params;

  const decodedServiceInstanceId = decodeURIComponent(slug);

  const response = await serverFetchGraphQL<serviceByIdQuery>(
    ServiceByIdQuery,
    {
      service_instance_id: decodedServiceInstanceId,
    }
  );
  return (
    <PageLoader
      serviceInstance={
        response.data
          .serviceInstanceById as unknown as serviceInstance_fragment$data
      }
    />
  );
};

export default Page;
