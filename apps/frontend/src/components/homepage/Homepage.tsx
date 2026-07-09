import { PublicLocale } from '@/i18n/config';
import MostDeployedResources from './resources/MostDeployedResources';
import XtmRoadmap from './roadmap/XtmRoadmap';
import XtmPlatform from './xtm-platform/XtmPlatform';
import BlueBlurDecoration from '@/components/homepage/BlueBlurDecoration';

type HomepageProps = { paramsLocale: PublicLocale };

const Homepage = ({ paramsLocale }: HomepageProps) => {
  return (
    <div className="relative overflow-hidden">
      <BlueBlurDecoration />
      <div className="flex flex-col gap-xxl">
        <XtmPlatform />
        <XtmRoadmap paramsLocale={paramsLocale} />
        <MostDeployedResources paramsLocale={paramsLocale} />
      </div>
    </div>
  );
};

export default Homepage;
