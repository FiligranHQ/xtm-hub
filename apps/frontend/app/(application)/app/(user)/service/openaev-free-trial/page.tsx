import FreeTrialPage from '@/components/service/trial-instances/page/FreeTrialPage';
import { parseFreeTrialSearchParams } from '@/utils/free-trial-search-params';
import { PlatformIdentifier } from '@graphql/generated';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { openTrialForm, source } =
    await parseFreeTrialSearchParams(searchParams);
  return (
    <FreeTrialPage
      platformIdentifier={PlatformIdentifier.Openaev}
      openTrialForm={openTrialForm}
      source={source}
    />
  );
};

export default Page;
