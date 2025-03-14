import CustomDashboardBento from '@/components/service/custom-dashboards/custom-dashboard-bento';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Badge } from 'filigran-ui/servers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SeoCustomDashboard {
  description: string;
  id: string;
  images: {
    id: string;
  }[];
  labels: {
    color: string;
    id: string;
    name: string;
  }[];
  name: string;
  slug: string;
  short_description: string;
  product_version: string;
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const awaitedParams = await params;
  try {
    const serviceResponse = await serverFetchGraphQL<seoServiceInstanceQuery>(
      SeoServiceInstanceQuery,
      {
        slug: awaitedParams.slug,
      }
    );
    const serviceInstance = serviceResponse.data
      .seoServiceInstance as unknown as seoServiceInstanceFragment$data;
    if (!serviceInstance) {
      notFound();
    }

    const customDashboardsResponse =
      await serverFetchGraphQL<seoCustomDashboardsByServiceSlugQuery>(
        SeoCustomDashboardsByServiceSlugQuery,
        {
          serviceSlug: awaitedParams.slug,
        }
      );

    const customDashboards = customDashboardsResponse.data
      .seoCustomDashboardsByServiceSlug as unknown as SeoCustomDashboard[];

    return (
      <>
        <h1 className="my-16 text-center text-[3.5rem]">
          {serviceInstance.name}
        </h1>
        {(customDashboards.length === 0 && (
          <div className="my-4 text-center">No custom dashboards found</div>
        )) || (
          <ul
            className={
              'grid grid-cols-1 s:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-xl'
            }>
            {customDashboards.map((customDashboard) => (
              <li
                key={customDashboard.id}
                className="block">
                <Link
                  className="cursor-pointer border-light flex flex-col relative rounded border bg-page-background gap-l aria-disabled:opacity-60"
                  href={`/cybersecurity-solutions/${serviceInstance.slug}/${customDashboard.slug}`}>
                  <CustomDashboardBento
                    customDashboard={
                      customDashboard as unknown as documentItem_fragment$data
                    }
                    serviceInstance={
                      serviceInstance as unknown as NonNullable<
                        serviceByIdQuery$data['serviceInstanceById']
                      >
                    }
                  />
                  <div className="flex items-center px-l justify-between">
                    <div className="flex gap-s items-center">
                      {customDashboard?.labels?.map(({ id, name, color }) => (
                        <Badge
                          key={id}
                          color={color}>
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <h2 className="truncate flex-1 px-l mt-l max-h-[10rem] overflow-hidden">
                    {customDashboard?.short_description}
                  </h2>
                  <div className="txt-mini p-l items-center flex">
                    {customDashboard.product_version && (
                      <div>From OpenCTI: {customDashboard.product_version}</div>
                    )}
                    <Badge
                      size="sm"
                      className="ml-auto"
                      style={{ color: '#7a7c85' }}>
                      Published
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default Page;
