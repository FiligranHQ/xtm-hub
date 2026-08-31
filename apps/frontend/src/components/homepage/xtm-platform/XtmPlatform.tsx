import { ConnectProductButton } from '@/components/connected-products/ConnectProductButton';
import { getTranslate } from '@/hooks/get-translate';
import { XtmPlatformHero } from './XtmPlatformHero';
import XtmPlatformImage from './XtmPlatformImage';

type XtmPlatformProps = {
  welcomeName?: string;
};

const XtmPlatform = async ({ welcomeName }: XtmPlatformProps = {}) => {
  const t = await getTranslate('PublicHomePage.XtmPlatform');
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-l items-center">
      <div className="flex flex-col gap-l">
        <span className="text-primary heading-sm font-semibold tracking-wide">
          {welcomeName ? t('LabelWithName', { name: welcomeName }) : t('Label')}
        </span>
        <XtmPlatformHero />
        <div className="w-53 flex items-center justify-between gap-s">
          <ConnectProductButton />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden flex items-center justify-end order-first md:order-last">
        <XtmPlatformImage />
      </div>
    </section>
  );
};

export default XtmPlatform;
