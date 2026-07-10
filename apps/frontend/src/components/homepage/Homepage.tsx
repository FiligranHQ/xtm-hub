import { PublicLocale } from '@/i18n/config';
import MostDeployedResources from './MostDeployedResources';
import XtmPlatform from './XtmPlatform';
import XtmRoadmap from './XtmRoadmap';

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
