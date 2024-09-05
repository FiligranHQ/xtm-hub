import * as React from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <>
      <h2>Manage services</h2>
      <PageLoader />
    </>
  );
};

// Component export
export default Page;
