import { XtmPlatformTrialMessagePanel } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialMessagePanel';
import { Button } from '@filigran/ui/servers';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const PublicXtmPlatformTrialPanel = async () => {
  const t = await getTranslations();

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
              href="/auth/oidc"
              prefetch={false}>
              {t('PublicLayout.Login')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">{t('PublicLayout.SignUp')}</Link>
          </Button>
        </>
      }
    />
  );
};
