import { TrialsDetailsPage } from '@/components/service/trial-instances/trials-details-page';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { pageLoaderRegisteredPlatformByServiceInstanceId_fragment$data } from '@generated/pageLoaderRegisteredPlatformByServiceInstanceId_fragment.graphql';
import pageRegisteredPlatformByServiceInstanceIdQueryGraphql, {
  pageLoaderRegisteredPlatformByServiceInstanceIdQuery,
} from '@generated/pageLoaderRegisteredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';
import { graphql } from 'react-relay';

export const registeredPlatformByServiceInstanceId = graphql`
  query pageLoaderRegisteredPlatformByServiceInstanceIdQuery(
    $input: RegisteredPlatformInput!
  ) {
    registeredPlatform(input: $input) {
      ...pageLoaderRegisteredPlatformByServiceInstanceId_fragment
    }
  }
`;

export const registeredPlatformByServiceInstanceIdFragment = graphql`
  fragment pageLoaderRegisteredPlatformByServiceInstanceId_fragment on RegisteredPlatform {
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

interface Props {
  serviceInstanceId: string;
}

const PageLoader = async ({ serviceInstanceId }: Props) => {
  const response =
    await serverFetchGraphQL<pageLoaderRegisteredPlatformByServiceInstanceIdQuery>(
      pageRegisteredPlatformByServiceInstanceIdQueryGraphql,
      {
        input: {
          service_instance_id: serviceInstanceId,
        },
      }
    );

  const data = response.data
    .registeredPlatform as unknown as pageLoaderRegisteredPlatformByServiceInstanceId_fragment$data;

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

export default PageLoader;
