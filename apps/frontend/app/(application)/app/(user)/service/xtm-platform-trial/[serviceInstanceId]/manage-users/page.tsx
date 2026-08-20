import ClientSection from './client-section';

export interface ServiceXtmPlatformBundleManageUsersPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}

const Page = ({ params }: ServiceXtmPlatformBundleManageUsersPageProps) => {
  return <ClientSection params={params} />;
};

export default Page;
