import * as React from 'react';
import OrganizationList from '@/components/organization/organization-list';

interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return <OrganizationList />;
};

// Component export
export default Page;
