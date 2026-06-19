import type { PublicLocale } from '@/i18n/config';
import MostDeployedResources from './MostDeployedResources';
import XtmPlatform from './XtmPlatform';
import XtmRoadmap from './XtmRoadmap';

type HomepageProps = { locale: PublicLocale };

const Homepage = ({ locale }: HomepageProps) => {
  return (
    <div className="flex flex-col gap-2xl">
      <XtmPlatform />
      <XtmRoadmap locale={locale} />
      <MostDeployedResources locale={locale} />
    </div>
  );
};

export default Homepage;
