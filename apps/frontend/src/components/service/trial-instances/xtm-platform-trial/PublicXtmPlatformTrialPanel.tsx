import { XtmPlatformTrialMessagePanel } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialMessagePanel';
import { APP_PATH } from '@/utils/path/constant';
import { Button } from '@filigran/ui/servers';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const PublicXtmPlatformTrialPanel = async () => {
  const t = await getTranslations();

  const redirectPath = `/${APP_PATH}/service/xtm-platform-trial`;
  const encodedRedirect = encodeURIComponent(btoa(redirectPath));

  return (
    <XtmPlatformTrialMessagePanel
      title={t('Service.Trials.XtmPlatform.Page.NotLoggedIn.Title')}
      description={t('Service.Trials.XtmPlatform.Page.NotLoggedIn.Description')}
      actions={
        <>
          <Button
            asChild
            variant="secondary">
            <Link
              href={`/auth/oidc?redirect=${encodedRedirect}`}
              prefetch={false}>
              {t('PublicLayout.Login')}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/sign-up?redirect=${encodedRedirect}`}>
              {t('PublicLayout.SignUp')}
            </Link>
          </Button>
        </>
      }
    />
  );
};
