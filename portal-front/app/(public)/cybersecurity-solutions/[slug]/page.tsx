import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { seoCustomDashboardFragment$data } from '@generated/seoCustomDashboardFragment.graphql';
import SeoCustomDashboardsByServiceSlugQuery, {
  seoCustomDashboardsByServiceSlugQuery,
} from '@generated/seoCustomDashboardsByServiceSlugQuery.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstanceQuery, {
  seoServiceInstanceQuery,
} from '@generated/seoServiceInstanceQuery.graphql';
import { Badge } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      .seoCustomDashboardsByServiceSlug as unknown as seoCustomDashboardFragment$data[];

    console.log(customDashboards);

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
              'grid grid-cols-1 s:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-xl'
            }>
            {customDashboards.map((customDashboard) => (
              <li
                key={customDashboard.id}
                className="border-light flex flex-col relative rounded border bg-page-background gap-xxl aria-disabled:opacity-60">
                <Image
                  alt={customDashboard.name}
                  src={`/document/images/${serviceInstance.id}/${customDashboard.children_documents[0].id}`}
                />
                <Link
                  className="cursor-pointer"
                  href={`/cybersecurity-solutions/${serviceInstance.slug}/${customDashboard.slug}`}>
                  <div className="flex items-center px-l justify-between">
                    <div className="flex gap-s items-center">
                      {customDashboard?.labels?.map(({ id, name, color }) => (
                        <Badge
                          key={id}
                          size="sm"
                          className="ml-auto"
                          style={{ color }}>
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
                      <div>
                        From OpenCTI Version : {customDashboard.product_version}
                      </div>
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
