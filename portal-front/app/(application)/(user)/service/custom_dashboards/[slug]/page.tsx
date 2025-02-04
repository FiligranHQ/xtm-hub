import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
  serviceByIdQuery$data,
} from '@generated/serviceByIdQuery.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { slug } = await params;
  let service: serviceByIdQuery$data['serviceInstanceById'] | null | undefined =
    null;
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
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <h1>{service.name}</h1>
      <PageLoader service={service} />
    </>
  );
};

export default Page;
