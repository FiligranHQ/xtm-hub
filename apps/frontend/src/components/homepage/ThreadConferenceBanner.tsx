import { getTranslate } from '@/hooks/get-translate';
import {
  FiligranWebsiteUtmCampaign,
  withFiligranWebsiteUtm,
} from '@/utils/filigran-website-utm';
import Image from 'next/image';
import Link from 'next/link';

const THREAD_CONFERENCE_URL = withFiligranWebsiteUtm(
  'https://filigran.io/thread?form_origin=xtmhub',
  { campaign: FiligranWebsiteUtmCampaign.HOME_BANNER, content: 'thread' }
);

const ThreadConferenceBanner = async () => {
  const t = await getTranslate();

  return (
    <Link
      href={THREAD_CONFERENCE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('ThreadConference.AriaLabel')}
      className="block z-10">
      <div className="overflow-hidden rounded bg-elevation-background-layer-1 dark:bg-black-1000">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-stretch">
          <div
            className="w-full self-stretch bg-[url('/thread-bg-light.png')] bg-cover bg-center bg-no-repeat px-6 py-6 sm:w-[48%] md:w-[52%] dark:bg-[url('/thread-bg.png')]"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, black 80%, transparent 100%)',
              maskImage:
                'linear-gradient(to right, black 80%, transparent 100%)',
            }}>
            <Image
              src="/thread-logo.svg"
              className="h-auto w-full max-w-[36rem] invert dark:invert-0"
              width={576}
              height={153}
              alt={t('ThreadConference.ImageAlt')}
            />
          </div>
          <div className="flex flex-col items-center gap-2 p-3 text-center sm:items-start sm:text-left sm:justify-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              {t('ThreadConference.Description')}
            </p>
            <p className="text-muted-foreground inline-flex items-center w-fit rounded-full border border-elevation-border-strong p-3">
              <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-blue" />
              {t('ThreadConference.Date')}
            </p>
          </div>
          <div className="mb-3 flex w-full shrink-0 items-center justify-center px-3 sm:mb-0 sm:mr-3 sm:w-auto sm:min-w-[14rem] sm:px-0">
            <span className="text-black-1000 flex w-full justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#DEFEA7] to-[#3693FF] px-6 py-3 text-content-button sm:w-fit">
              {t('ThreadConference.Cta')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ThreadConferenceBanner;
