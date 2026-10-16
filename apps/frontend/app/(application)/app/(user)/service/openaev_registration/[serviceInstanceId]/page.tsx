import { RegisteredPlatformOverview } from '@/components/service/registration/RegisteredPlatformOverview';
import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { ServiceInstanceTag } from '@graphql/generated';

export interface ServiceOpenAEVRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenAEVRegistrationPageProps) => {
  return (
    <>
      <RegisteredPlatformOverview params={params} />
      <RegistrationLearnMore serviceInstanceTag={ServiceInstanceTag.OpenAev} />
    </>
  );
};

export default Page;
