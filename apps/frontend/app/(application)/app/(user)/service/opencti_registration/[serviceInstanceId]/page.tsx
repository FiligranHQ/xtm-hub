import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { ServiceInstanceTag } from '@graphql/generated';
import ClientSection from './client-section';

export interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore serviceInstanceTag={ServiceInstanceTag.OpenCti} />
    </>
  );
};

export default Page;
