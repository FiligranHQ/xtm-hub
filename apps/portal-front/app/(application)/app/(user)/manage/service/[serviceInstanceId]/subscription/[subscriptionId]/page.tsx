import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { redirect } from 'next/navigation';
import { FunctionComponent } from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ subscriptionId: string; serviceInstanceId: string }>;
}

const Page: FunctionComponent<PageProps> = async ({ params }) => {
  const { subscriptionId, serviceInstanceId } = await params;
  const decodedSubscriptionId = decodeURIComponent(subscriptionId);
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);
  const response = await serverFetchGraphQL<serviceByIdQuery>(
    ServiceByIdQuery,
    {
      service_instance_id: decodedServiceInstanceId,
    }
  );
  try {
    return (
      <PageLoader
        subscriptionId={decodedSubscriptionId}
        serviceInstance={
          response.data
            .serviceInstanceById as unknown as serviceInstance_fragment$data
        }
      />
    );
  } catch (_) {
    // If error at user loading, redirect to the list
    redirect(`/${APP_PATH}`);
  }
};

export default Page;
