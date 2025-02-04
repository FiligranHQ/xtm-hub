import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { slug } = await params;
  let service;
  try {
    const response = await serverFetchGraphQL<serviceByIdQuery>(
      ServiceByIdQuery,
      {
        service_instance_id: decodeURIComponent(slug),
      }
    );

    service = response.data?.serviceInstanceById;
  } catch (error) {
    console.error(error);
    throw new Error('Service not found');
  }

  if (!service) {
    throw new Error('Service not found');
  }

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
    },
    {
      label: service.name,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <h1>{slug}</h1>
      <PageLoader />
    </>
  );
};

export default Page;
