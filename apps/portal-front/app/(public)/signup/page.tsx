import SignUp from '@/components/signup/SignUp';
import { getMetadataBase } from '@/utils/metadata';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Sign up XTM Hub',
    description: 'XTM Hub application by Filigran',
    metadataBase: await getMetadataBase(),
  };
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  return (
    <div className="flex items-center justify-center">
      <SignUp />
    </div>
  );
};

export default Page;
