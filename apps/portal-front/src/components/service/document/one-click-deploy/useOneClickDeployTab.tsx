import { RefreshUserPlatformTokenMutation } from '@/components/register/register.graphql';
import useExternalTab from '@/hooks/useExternalTab';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import {
  registerRefreshUserPlatformTokenMutation,
  registerRefreshUserPlatformTokenMutation$data,
} from '@generated/registerRefreshUserPlatformTokenMutation.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

const URL_CONFIGS = {
  custom_dashboard: 'deploy-custom-dashboard',
  csv_feed: 'deploy-csv-feed',
};

interface Props {
  openCTIBasePath: string;
  documentData: ShareableResource;
}

interface Return {
  openTab: () => void;
}

export const useOneClickDeployTab = ({
  openCTIBasePath,
  documentData,
}: Props): Return => {
  const t = useTranslations();
  const [refreshUserPlatformToken] =
    useMutation<registerRefreshUserPlatformTokenMutation>(
      RefreshUserPlatformTokenMutation
    );

  const handleMessage = (event: MessageEvent) => {
    const eventData = event.data;
    const { action } = eventData;
    if (action === 'refresh-token') {
      refreshUserPlatformToken({
        variables: {},
        onCompleted,
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: <>{t(`Error.Server.${error.message}`)}</>,
          });
        },
      });
    }
  };

  const { openTab, postMessage } = useExternalTab({
    url: `${openCTIBasePath}/dashboard/xtm-hub/${URL_CONFIGS[documentData.type as keyof typeof URL_CONFIGS]}/${documentData.service_instance?.id}/${documentData.id}`,
    tabName: 'opencti-one-click-deploy',
    onMessage: handleMessage,
  });

  const onCompleted = (
    response: registerRefreshUserPlatformTokenMutation$data
  ) => {
    postMessage({
      action: 'set-token',
      token: response.refreshUserPlatformToken.token,
    });
  };

  return {
    openTab,
  };
};
