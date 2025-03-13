import ServiceInstanceCard from '@/components/service/service-instance-card';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';

const Page = async () => {
  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery
  );
  const services = response.data
    .seoServiceInstances as unknown as serviceList_fragment$data[];

  return (
    <>
      <h1 className="my-16 text-center text-[3.5rem]">
        Discover resources and expertise
      </h1>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-xxl'
        }>
        {services.map((service) => (
          <ServiceInstanceCard
            key={service.id}
            serviceInstance={service}
            seo={true}
          />
        ))}
      </ul>
    </>
  );
};

export default Page;
