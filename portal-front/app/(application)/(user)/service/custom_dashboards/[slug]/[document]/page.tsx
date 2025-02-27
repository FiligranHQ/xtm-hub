import {
  serverFetchGraphQL,
  serverMutateGraphQL,
} from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
  serviceByIdQuery$data,
} from '@generated/serviceByIdQuery.graphql';
import ServiceSelfJoinMutation, {
  serviceSelfJoinMutation,
} from '@generated/serviceSelfJoinMutation.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ slug: string; document: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { slug, document } = await params;
  const service_instance_id = decodeURIComponent(slug);
  const documentId = decodeURIComponent(document);

  let serviceInstance:
    | serviceByIdQuery$data['serviceInstanceById']
    | null
    | undefined = null;
  try {
    const response = await serverFetchGraphQL<serviceByIdQuery>(
      ServiceByIdQuery,
      {
        service_instance_id,
      }
    );

    serviceInstance = response.data?.serviceInstanceById;
  } catch (error) {
    // The user must self join the service before accessing it
    if (
      (error as Error).message ===
      'ERROR_SERVICE_INSTANCE_USER_MUST_JOIN_SERVICE'
    ) {
      const response = await serverMutateGraphQL<serviceSelfJoinMutation>(
        ServiceSelfJoinMutation,
        {
          service_instance_id,
        }
      );

      serviceInstance = response.data
        ?.selfJoinServiceInstance as serviceByIdQuery$data['serviceInstanceById'];
    }
  }

  return (
    <>
      {documentId && serviceInstance ? (
        <>
          <PageLoader
            documentId={documentId}
            service={serviceInstance}
          />
        </>
      ) : (
        <h1>Document not found</h1>
      )}
    </>
  );
};

export default Page;
