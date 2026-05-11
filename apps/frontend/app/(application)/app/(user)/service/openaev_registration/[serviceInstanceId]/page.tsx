import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import ClientSection from './client-section';

export interface ServiceOpenAEVRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenAEVRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore
        serviceInstanceTag={ServiceInstanceTagEnum.OPENAEV}
      />
    </>
  );
};

export default Page;
