import { PublicMobileMenuButton } from '@/components/menu/navigation/public/PublicMobileMenuButton';
import { isFeatureEnabled } from '@/utils/settings.service';
import { Button } from '@filigran/ui/servers';
import { FeatureFlag } from '@graphql/generated';
import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface PublicHeaderContentProps {
  locale: string;
}

export const PublicHeaderContent = async ({
  locale,
}: PublicHeaderContentProps) => {
  const t = await getTranslations();
  const isHomePageV2Enabled = await isFeatureEnabled(FeatureFlag.HomePageV2);
  const isCustomViewsEnabled = await isFeatureEnabled(FeatureFlag.CustomViews);

  return (
    <>
      <Link
        href={`/${locale}`}
        className={isHomePageV2Enabled ? 'md:hidden' : undefined}>
        <LogoXTMDark className="text-primary mr-2 h-8 w-auto" />
        <span className="sr-only">{t('Metadata.SiteName')}</span>
      </Link>
      {isHomePageV2Enabled ? (
        <div className="flex items-center gap-s ml-auto">
          <Button variant="secondary">
            <Link href="/auth/oidc">{t('PublicLayout.Login')}</Link>
          </Button>
          <Button
            asChild
            className="whitespace-nowrap">
            <Link href={`/sign-up`}>{t('PublicLayout.SignUp')}</Link>
          </Button>
          <div className="md:hidden flex items-center">
            <PublicMobileMenuButton
              isCustomViewsEnabled={isCustomViewsEnabled}
            />
          </div>
        </div>
      ) : (
        <Button
          asChild
          className="whitespace-nowrap">
          <Link href={`/login`}>{t('PublicLayout.SignIn')}</Link>
        </Button>
      )}
    </>
  );
};
