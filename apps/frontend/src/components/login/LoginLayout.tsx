import { TestEnvBanner } from '@/components/admin/TestEnvBanner';
import LoginForm from '@/components/login/LoginForm';
import LoginMessage from '@/components/login/LoginMessage';
import LoginTitleForm from '@/components/login/LoginTitle';
import { PlatformProviderButton } from '@/components/login/PlatformProviderButton';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import useDecodedQuery from '@/hooks/use-decoded-query';
import { useIsFeatureEnabled } from '@/hooks/use-is-feature-enabled';
import { useToast } from '@filigran/ui/clients';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export const LoginLayout = ({}) => {
  const { settings } = useContext(SettingsContext);
  const isHomePageV2Enabled = useIsFeatureEnabled(FeatureFlagEnum.HOME_PAGE_V2);
  const router = useRouter();

  const { error, redirect } = useDecodedQuery();
  const currentPath = usePathname();
  const { toast } = useToast();
  const t = useTranslations();

  const localProvider = settings?.platform_providers?.find(
    (p) => p.provider === 'local'
  );

  useEffect(() => {
    if (isHomePageV2Enabled && !localProvider) {
      const target = redirect ? `/sign-up?redirect=${redirect}` : '/sign-up';
      router.replace(target);
    }
  }, [isHomePageV2Enabled, localProvider, redirect, router]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: t('UnexpectedErrorDialog.Title'),
        description: t('UnexpectedErrorDialog.Description'),
      });
    }
  }, [currentPath, error, t, toast]);

  if (isHomePageV2Enabled && !localProvider) {
    return null;
  }

  return (
    <main className="absolute inset-0 z-0 m-auto flex max-w-[450px] flex-col justify-center">
      <TestEnvBanner />
      <div className="flex flex-col items-center p-xl sm:p-0">
        <LoginTitleForm />
        <div className="space-y-l mt-l w-full flex flex-col items-center">
          <LoginMessage />
          {isHomePageV2Enabled
            ? localProvider && <LoginForm />
            : settings?.platform_providers?.map((platformProvider) =>
                platformProvider.provider === 'local' ? (
                  <LoginForm key={platformProvider.provider} />
                ) : (
                  <PlatformProviderButton
                    key={platformProvider.provider}
                    platformProvider={platformProvider}
                  />
                )
              )}
        </div>
      </div>
    </main>
  );
};
