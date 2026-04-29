import { parseFreeTrialSearchParams } from '@/utils/free-trial-search-params';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';
import FreeTrialPage from '@/components/service/trial-instances/page/FreeTrialPage';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: React.FC<Props> = async ({ searchParams }) => {
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
