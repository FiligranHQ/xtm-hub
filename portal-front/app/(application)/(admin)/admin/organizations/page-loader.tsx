import OrganizationList from '@/components/organization/organization-list';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

const breadcrumbValue = [
  {
    label: 'Backoffice',
  },
  {
    label: 'Organizations',
  },
];
const PageLoader = () => {
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="pb-s">Organizations list</h1>
      <OrganizationList />
    </>
  );
};

// Component export
export default PageLoader;
