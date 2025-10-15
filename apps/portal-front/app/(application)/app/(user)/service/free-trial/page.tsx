import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';

const Page = async ({}) => {
  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'OpenCTI Trial platform',
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />

      <h1>OpenCTI Trial platform</h1>
      <span>TODO Ellyn : on met quoi ici :) </span>
      <StartTrialButton />
    </>
  );
};

export default Page;
