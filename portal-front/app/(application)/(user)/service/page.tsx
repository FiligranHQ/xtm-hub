import * as React from 'react';
import PageLoader from './page-loader';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

const breadcrumbValue = [
  {
    label: 'Services',
  },
];
// Component
const Page: React.FunctionComponent<PageProps> = async () => {
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <PageLoader />
    </>
  );
};

// Component export
export default Page;
