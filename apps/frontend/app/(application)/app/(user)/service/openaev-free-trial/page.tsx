import FreeTrialPage from '@/components/service/trial-instances/page/FreeTrialPage';
import { parseFreeTrialSearchParams } from '@/utils/free-trial-search-params';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { openTrialForm, source } =
    await parseFreeTrialSearchParams(searchParams);
  return (
    <FreeTrialPage
      platformIdentifier={PlatformIdentifierEnum.OPENAEV}
      openTrialForm={openTrialForm}
      source={source}
    />
  );
};

export default Page;
