import {
  serverFetchGraphQL,
  serverMutateGraphQL,
} from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import ServiceSelfJoinMutation, {
  serviceSelfJoinMutation,
} from '@generated/serviceSelfJoinMutation.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ serviceInstanceId: string; documentId: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { serviceInstanceId, documentId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);
  const decodedDocumentId = decodeURIComponent(documentId);

  let serviceInstance: serviceInstance_fragment$data | null | undefined = null;
  try {
    const response = await serverFetchGraphQL<serviceByIdQuery>(
      ServiceByIdQuery,
      {
        service_instance_id: decodedServiceInstanceId,
      }
    );

    serviceInstance = response.data
      .serviceInstanceById as unknown as serviceInstance_fragment$data; // will be reworked in #579
  } catch (error) {
    // The user must self join the service before accessing it
    if (
      (error as Error).message ===
      'ERROR_SERVICE_INSTANCE_USER_MUST_JOIN_SERVICE'
    ) {
      const response = await serverMutateGraphQL<serviceSelfJoinMutation>(
        ServiceSelfJoinMutation,
        {
          service_instance_id: decodedServiceInstanceId,
        }
      );

      serviceInstance = response.data
        .selfJoinServiceInstance as unknown as serviceInstance_fragment$data; // will be reworked in #579
    }
  }

  return (
    <>
      {decodedDocumentId && serviceInstance ? (
        <PageLoader
          documentId={decodedDocumentId}
          service={serviceInstance}
        />
      ) : (
        <h1>Document not found</h1>
      )}
    </>
  );
};

export default Page;
