import {
  RegistrationDetailsPage,
  RegistrationDetailsPageProps,
} from '@/components/service/registration/RegistrationDetailsPage';
import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import { ServiceInstanceTag } from '@graphql/generated';

const Page = ({ params }: RegistrationDetailsPageProps) => {
  return (
    <>
      <RegistrationDetailsPage params={params} />
      <RegistrationLearnMore serviceInstanceTag={ServiceInstanceTag.OpenCti} />
    </>
  );
};

export default Page;
