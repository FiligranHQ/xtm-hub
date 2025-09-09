import ServiceInstanceCard from '@/components/service/service-instance-card';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { seoServiceInstanceToInstanceCardData } from '@/utils/services';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import SeoServiceInstancesQuery, {
  seoServiceInstancesQuery,
} from '@generated/seoServiceInstancesQuery.graphql';

const Page = async () => {
  const response = await serverFetchGraphQL<seoServiceInstancesQuery>(
    SeoServiceInstancesQuery,
    {},
    { cache: undefined, next: { revalidate: 3600 } }
  );
  const services = response.data
    .seoServiceInstances as unknown as seoServiceInstanceFragment$data[];

  return (
    <>
      <h1 className="leading-tight my-8 md:my-16 text-center text-[2.5rem] md:text-[3.5rem]">
        Discover resources and expertise
      </h1>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-l'
        }>
        {/*Temporary, until the filters will be OK in the Integration Feed service*/}
        <ServiceInstanceCard
          key={'Connector'}
          serviceInstance={{
            id: 'Connector',
            creation_status: ServiceInstanceCreationStatusEnum.CREATED,
            name: 'OpenCTI Connectors',
            slug: 'opencti-connectors',
            description:
              'Explore a range of OpenCTI Connectors shared by the Filigran team',
            illustration_document_id: '' as string,
            logo_document_id: '' as string,
            service_definition_identifier:
              ServiceDefinitionIdentifierEnum.CSV_FEEDS,
            url: 'coucou',
            ordering: 0,
          }}
          seo={true}
        />
        {services.map((service) => (
          <ServiceInstanceCard
            key={service.id}
            serviceInstance={seoServiceInstanceToInstanceCardData(service)}
            seo={true}
          />
        ))}
      </ul>
    </>
  );
};

export default Page;
