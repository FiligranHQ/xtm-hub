import { TrialsDetailsPage } from '@/components/service/trial-instances/trials-details-page';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { pageRegisteredPlatformByServiceInstanceId_fragment$data } from '@generated/pageRegisteredPlatformByServiceInstanceId_fragment.graphql';
import pageRegisteredPlatformByServiceInstanceIdQueryGraphql, {
  pageRegisteredPlatformByServiceInstanceIdQuery,
} from '@generated/pageRegisteredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';
import { graphql } from 'react-relay';

interface ServiceCustomDashboardsPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

export const registeredPlatformByServiceInstanceId = graphql`
  query pageRegisteredPlatformByServiceInstanceIdQuery(
    $input: RegisteredPlatformInput!
  ) {
    registeredPlatform(input: $input) {
      ...pageRegisteredPlatformByServiceInstanceId_fragment
    }
  }
`;

export const registeredPlatformByServiceInstanceIdFragment = graphql`
  fragment pageRegisteredPlatformByServiceInstanceId_fragment on RegisteredPlatform {
    id
    title
    contract
    url
    deployment_request {
      status
      start_date
      end_date
    }
  }
`;

const Page = async ({ params }: ServiceCustomDashboardsPageProps) => {
  const { serviceInstanceId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);
  const response =
    await serverFetchGraphQL<pageRegisteredPlatformByServiceInstanceIdQuery>(
      pageRegisteredPlatformByServiceInstanceIdQueryGraphql,
      {
        input: {
          service_instance_id: decodedServiceInstanceId,
        },
      }
    );

  const data = response.data
    .registeredPlatform as unknown as pageRegisteredPlatformByServiceInstanceId_fragment$data;

  if (!data || data.contract !== PlatformContractEnum.TRIAL) {
    notFound();
  }

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: data.title,
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      {data.contract === PlatformContractEnum.TRIAL && (
        <TrialsDetailsPage platform={data} />
      )}
    </>
  );
};

export default Page;
