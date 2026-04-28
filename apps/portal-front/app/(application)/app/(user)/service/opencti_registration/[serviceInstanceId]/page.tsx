import { ServiceInstanceTagEnum } from '@generated/models/ServiceInstanceTag.enum';
import { RegistrationLearnMore } from '../../../../../../../src/components/service/registration/RegistrationLearnMore';
import ClientSection from './client-section';

export interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore
        serviceInstanceTag={ServiceInstanceTagEnum.OPENCTI}
      />
    </>
  );
};

export default Page;
