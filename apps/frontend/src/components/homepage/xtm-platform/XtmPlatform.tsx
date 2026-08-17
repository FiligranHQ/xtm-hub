import { ConnectProductButton } from '@/components/connected-products/ConnectProductButton';
import { getTranslate } from '@/tolgee/server';
import XtmPlatformImage from './XtmPlatformImage';

type XtmPlatformProps = {
  welcomeName?: string;
};

const XtmPlatform = async ({ welcomeName }: XtmPlatformProps = {}) => {
  const t = await getTranslate();
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-l items-center">
      <div className="flex flex-col gap-l">
        <span className="text-primary heading-sm font-semibold tracking-wide">
          {welcomeName
            ? t('PublicHomePage_XtmPlatform_LabelWithName', {
                name: welcomeName,
              })
            : t('PublicHomePage_XtmPlatform_Label')}
        </span>
        <h1 className="heading-2xl">{t('PublicHomePage_XtmPlatform_Title')}</h1>
        <p className="text-muted-foreground text-xs max-w-110">
          {t('PublicHomePage_XtmPlatform_Description')}
        </p>
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
