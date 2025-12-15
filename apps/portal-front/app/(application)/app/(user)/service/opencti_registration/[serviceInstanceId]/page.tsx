import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import ClientSection from './client-section';

export interface ServiceOpenCTIRegistrationPageProps {
  params: Promise<{ serviceInstanceId: string }>;
}
const Page = ({ params }: ServiceOpenCTIRegistrationPageProps) => {
  return (
    <>
      <ClientSection params={params} />
      <TrialsLearnMore />
    </>
  );
};

export default Page;
