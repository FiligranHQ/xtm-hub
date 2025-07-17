import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import {
  serverFetchGraphQL,
  serverMutateGraphQL,
} from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import ServiceByIdQuery, {
  serviceByIdQuery,
  serviceByIdQuery$data,
} from '@generated/serviceByIdQuery.graphql';
import ServiceSelfJoinMutation, {
  serviceSelfJoinMutation,
} from '@generated/serviceSelfJoinMutation.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { serviceInstanceId } = await params;
  const service_instance_id = decodeURIComponent(serviceInstanceId);
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

    serviceInstance = response.data.serviceInstanceById;
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
        .selfJoinServiceInstance as serviceByIdQuery$data['serviceInstanceById'];
    }
  }

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: serviceInstance!.name,
      original: true,
    },
  ];

  return (
    <>
      {serviceInstance ? (
        <>
          <BreadcrumbNav value={breadcrumbs} />
          <PageLoader serviceInstance={serviceInstance} />
        </>
      ) : (
        <h1>Service not found</h1>
      )}
    </>
  );
};

export default Page;
