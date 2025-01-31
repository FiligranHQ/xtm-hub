import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: { slug: string };
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
    },
    {
      label: params.slug,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <h1>{params.slug}</h1>
      <PageLoader />
    </>
  );
};

export default Page;
