import * as React from 'react';
import OwnedServices from '@/components/service/owned-services';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <>
      <h1>Welcome to the portal</h1>

      <OwnedServices />
    </>
  );
};

// Component export
export default Page;
