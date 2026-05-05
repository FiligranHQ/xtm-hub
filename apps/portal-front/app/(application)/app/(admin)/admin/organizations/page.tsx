'use client';
import GuardCapacityComponent from '@/components/AdminGuard';
import PageLoader from './page-loader';

// Component
const Page = () => {
  return (
    <GuardCapacityComponent displayError>
      <PageLoader />
    </GuardCapacityComponent>
  );
};

// Component export
export default Page;
