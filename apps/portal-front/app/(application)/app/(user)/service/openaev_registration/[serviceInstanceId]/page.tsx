import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import ClientSection from './client-section';

export interface ServiceOpenAEVRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenAEVRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <RegistrationLearnMore />
    </>
  );
};

export default Page;
