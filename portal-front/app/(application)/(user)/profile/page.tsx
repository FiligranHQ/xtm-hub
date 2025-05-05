import * as React from 'react';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

// Component
const Page: React.FunctionComponent = async () => {
  return <PageLoader />;
};

// Component export
export default Page;
