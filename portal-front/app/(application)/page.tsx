'use client';
import * as React from 'react';
import { useContext } from 'react';
import { Portal, portalContext } from '@/components/portal-context';
import { getSubscriptionsByOrganization } from '@/components/subcription/subscription.service';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  const { me } = useContext<Portal>(portalContext);
  console.log('mePAGE', me);

  const [subscriptions, refetch] = getSubscriptionsByOrganization(
    me?.organization_id
  );
  console.log('subscriptionsPAGE', subscriptions);
  return (
    <>
      <div>
        <b>Welcome to the platform</b>
      </div>
    </>
  );
};

// Component export
export default Page;
