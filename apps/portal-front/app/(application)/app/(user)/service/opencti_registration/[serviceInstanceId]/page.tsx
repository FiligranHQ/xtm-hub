import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import ClientPage from './client-page';

export interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  return (
    <>
      <ClientPage params={params} />
      <TrialsLearnMore />
    </>
  );
};

export default Page;
