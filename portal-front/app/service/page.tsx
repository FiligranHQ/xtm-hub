import * as React from 'react';
import PageLoader from './page-loader';

// Configuration or Preloader Query
const DEFAULT_COUNT = 10;

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <>
      <h1>SERVICE</h1>
      <PageLoader/>
    </>
  );
};

// Component export
export default Page;
