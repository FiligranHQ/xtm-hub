import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { TrialsLearnMore } from '@/components/trials/trials-learn-more';
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

      <header className="flex justify-between items-start mt-l">
        <div className="flex flex-col">
          <h2 className="text-blue text-2xl mb-2">Welcome to Filigran</h2>
          <h1 className="text-3xl">
            New to OpenCTI Trial? This is a great place to start!
          </h1>
        </div>
        <div className="flex gap-s">
          <ContactUsButton />
          <StartTrialButton />
        </div>
      </header>
      <TrialsLearnMore />
    </>
  );
};

export default Page;
