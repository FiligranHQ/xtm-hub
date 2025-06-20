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
  try {
    return (
      <PageLoader
        subscriptionId={decodedSubscriptionId}
        serviceInstanceId={decodedServiceInstanceId}
      />
    );
  } catch (_) {
    // If error at user loading, redirect to the list
    redirect('/app');
  }
};

export default Page;
