import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import ServiceByIdQuery, {
  serviceByIdQuery,
} from '@generated/serviceByIdQuery.graphql';
import PageLoader from './page-loader';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ slug: string; document: string }>;
}

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { slug, document } = await params;
  const service_instance_id = decodeURIComponent(slug);
  const documentId = decodeURIComponent(document);

  const responseService = await serverFetchGraphQL<serviceByIdQuery>(
    ServiceByIdQuery,
    {
      service_instance_id,
    }
  );

  return (
    <>
      {documentId && responseService.data ? (
        <>
          <PageLoader
            documentId={documentId}
            service={responseService.data}
          />
        </>
      ) : (
        <h1>Document not found</h1>
      )}
    </>
  );
};

export default Page;
