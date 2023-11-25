import * as React from 'react';
import PageLoader from './page-loader';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return <PageLoader />;
};

// Component export
export default Page;
