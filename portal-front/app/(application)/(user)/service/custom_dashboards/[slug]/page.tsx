import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery from '@generated/serviceByIdQuery.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: { slug: string };
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  // On lance la requête côté serveur avec Relay en passant le paramètre slug en tant que service_instance_id.
  const _response = await serverPortalApiFetch(ServiceByIdQuery, {
    service_instance_id: params.slug,
  });

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
