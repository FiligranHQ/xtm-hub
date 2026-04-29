import { useToast } from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { FunctionComponent, useContext, useEffect } from 'react';
import useDecodedQuery from '@/hooks/use-decoded-query';
import { TestEnvBanner } from '@/components/admin/TestEnvBanner';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import LoginForm from '@/components/login/LoginForm';
import LoginMessage from '@/components/login/LoginMessage';
import LoginTitleForm from '@/components/login/LoginTitle';
import { PlatformProviderButton } from '@/components/login/PlatformProviderButton';

export const LoginLayout: FunctionComponent = ({}) => {
  const { settings } = useContext(SettingsContext);

  const { error } = useDecodedQuery();
  const currentPath = usePathname();
  const { toast } = useToast();
  const t = useTranslations();
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: t('UnexpectedErrorDialog.Title'),
        description: t('UnexpectedErrorDialog.Description'),
      });
    }
  }, [currentPath, error, t, toast]);
  return (
    <main className="absolute inset-0 z-0 m-auto flex max-w-[450px] flex-col justify-center">
      <TestEnvBanner />
      <div className="flex flex-col items-center p-xl sm:p-0">
        <LoginTitleForm />
        <div className="space-y-l mt-l w-full flex flex-col items-center">
          <LoginMessage />
          {settings?.platform_providers?.map((platformProvider) =>
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
