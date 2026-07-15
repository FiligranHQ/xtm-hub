import { PublicLocale } from '@/i18n/config';
import MostDeployedResources from './resources/MostDeployedResources';
import XtmRoadmap from './roadmap/XtmRoadmap';
import XtmPlatform from './xtm-platform/XtmPlatform';

type HomepageProps = { paramsLocale: PublicLocale };

const Homepage = ({ paramsLocale }: HomepageProps) => {
  return (
    <div className="flex flex-col gap-12">
      <XtmPlatform />
      <XtmRoadmap paramsLocale={paramsLocale} />
      <MostDeployedResources paramsLocale={paramsLocale} />
    </div>
  );
};

export default Homepage;
