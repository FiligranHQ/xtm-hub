import LoginForm from '@/components/login/login-form';
import LoginMessage from '@/components/login/login-message';
import LoginTitleForm from '@/components/login/login-title';
import { PlatformProviderButton } from '@/components/login/platform-provider-button';
import { SettingsQuery } from '@/components/login/settings.graphql';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FunctionComponent, useEffect } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { settingsQuery } from '../../../__generated__/settingsQuery.graphql';
interface LoginLayoutProps {
  queryRef: PreloadedQuery<settingsQuery>;
}

export const LoginLayout: FunctionComponent<LoginLayoutProps> = ({
  queryRef,
}) => {
  const data = usePreloadedQuery<settingsQuery>(SettingsQuery, queryRef);
  const router = useRouter();
  const { redirect } = useDecodedQuery();
  const currentPath = usePathname();
  const { toast } = useToast();
  const t = useTranslations();
  useEffect(() => {
    if (redirect) {
      router.push(atob(redirect));

      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: t('Error.Disconnected'),
      });
    }
  }, [currentPath]);
  return (
    <main className="absolute inset-0 z-0 m-auto flex max-w-[450px] flex-col justify-center">
      <div className="flex flex-col items-center p-xl sm:p-0">
        <LoginTitleForm />
        <div className="space-y-l mt-l w-full flex flex-col items-center">
          <LoginMessage />
          {data.settings.platform_providers.map((platformProvider) =>
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
