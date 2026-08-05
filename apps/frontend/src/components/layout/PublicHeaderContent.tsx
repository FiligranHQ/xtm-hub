import { PublicMobileMenuButton } from '@/components/menu/navigation/public/PublicMobileMenuButton';
import { Button } from '@filigran/ui/servers';
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

  return (
    <>
      <Link
        href={`/${locale}`}
        className="md:hidden">
        <LogoXTMDark className="text-primary mr-2 h-8 w-auto" />
        <span className="sr-only">{t('Metadata.SiteName')}</span>
      </Link>
      <div className="flex items-center gap-s ml-auto">
        <Button variant="secondary">
          <Link
            href="/auth/oidc"
            prefetch={false}>
            {t('PublicLayout.Login')}
          </Link>
        </Button>
        <Button
          asChild
          className="whitespace-nowrap">
          <Link href={`/sign-up`}>{t('PublicLayout.SignUp')}</Link>
        </Button>
        <div className="md:hidden flex items-center">
          <PublicMobileMenuButton />
        </div>
      </div>
    </>
  );
};
