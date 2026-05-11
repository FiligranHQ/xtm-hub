import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import PageLoader from './page-loader';
interface ServiceRoadmapPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = async ({ params }: ServiceRoadmapPageProps) => {
  const { serviceInstanceId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);

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
          .serviceInstanceByIdAndGrantAccess as unknown as serviceInstance_fragment$data
      }
    />
  );
};

export default Page;
