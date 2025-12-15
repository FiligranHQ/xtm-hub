import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import ClientSection from './client-section';

export interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore />
    </>
  );
};

export default Page;
