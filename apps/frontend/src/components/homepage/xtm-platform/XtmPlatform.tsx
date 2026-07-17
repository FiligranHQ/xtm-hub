import { ConnectProductButton } from '@/components/connected-products/ConnectProductButton';
import { getTranslations } from 'next-intl/server';
import XtmPlatformImage from './XtmPlatformImage';

type XtmPlatformProps = {
  welcomeName?: string;
};

const XtmPlatform = async ({ welcomeName }: XtmPlatformProps = {}) => {
  const t = await getTranslations('PublicHomePage.XtmPlatform');
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-l items-center">
      <div className="flex flex-col gap-l">
        <span className="text-primary heading-sm font-semibold tracking-wide">
          {welcomeName ? t('LabelWithName', { name: welcomeName }) : t('Label')}
        </span>
        <h1 className="heading-2xl">{t('Title')}</h1>
        <p className="text-muted-foreground text-xs max-w-110">
          {t('Description')}
        </p>
        <div className="w-53 flex items-center justify-between gap-s">
          <ConnectProductButton />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden flex items-center justify-end">
        <XtmPlatformImage />
      </div>
    </section>
  );
};

export default XtmPlatform;
