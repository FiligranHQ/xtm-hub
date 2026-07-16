import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import ConnectProductButton from './ConnectProductButton';

type XtmPlatformProps = {
  welcomeName?: string;
};

const XtmPlatform = async ({ welcomeName }: XtmPlatformProps = {}) => {
  const t = await getTranslations('PublicHomePage.XtmPlatform');

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-l items-center">
      <div className="flex flex-col gap-l">
        <span className="text-primary txt-small font-semibold tracking-wide">
          {welcomeName ? t('LabelWithName', { name: welcomeName }) : t('Label')}
        </span>
        <h1 className="text-2xl leading-tight">{t('Title')}</h1>
        <p className="text-muted-foreground text-xs max-w-110">
          {t('Description')}
        </p>
        <div>
          <ConnectProductButton />
        </div>
      </div>

      <div className="rounded-lg overflow-hidden flex items-center justify-end">
        <Image
          src="/xtm_platform.png"
          alt={t('ImageAlt')}
          width={1370}
          height={680}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            width: 'auto',
            height: '100%',
            maxHeight: '280px',
            marginTop: '-10px',
          }}
          priority
        />
      </div>
    </section>
  );
};

export default XtmPlatform;
