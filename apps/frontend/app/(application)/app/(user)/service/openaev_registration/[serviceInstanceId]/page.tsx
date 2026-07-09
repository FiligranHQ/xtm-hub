import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { ServiceInstanceTag } from '@graphql/generated';
import ClientSection from './client-section';

export interface ServiceOpenAEVRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenAEVRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore serviceInstanceTag={ServiceInstanceTag.OpenAev} />
    </>
  );
};

export default Page;
