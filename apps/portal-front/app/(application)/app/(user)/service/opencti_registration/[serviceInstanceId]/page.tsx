import { TrialsDetailsPage } from '@/components/service/trial-instances/trials-details-page';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import registeredPlatformByServiceInstanceIdQueryGraphql, {
  registeredPlatformByServiceInstanceIdQuery,
} from '@generated/registeredPlatformByServiceInstanceIdQuery.graphql';
import { notFound } from 'next/navigation';

interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = async ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  const { serviceInstanceId } = await params;
  const decodedServiceInstanceId = decodeURIComponent(serviceInstanceId);

  const response =
    await serverFetchGraphQL<registeredPlatformByServiceInstanceIdQuery>(
      registeredPlatformByServiceInstanceIdQueryGraphql,
      {
        input: {
          service_instance_id: decodedServiceInstanceId,
        },
      }
    );

  const data = response.data
    .registeredPlatform as unknown as registeredPlatformByServiceInstanceId_fragment$data;

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
