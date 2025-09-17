import { RefreshUserPlatformTokenMutation } from '@/components/registration/register/register.graphql';
import { ShareableResourceType } from '@/components/service/document/shareable-resource-slug';
import useExternalTab from '@/hooks/useExternalTab';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import {
  registerRefreshUserPlatformTokenMutation,
  registerRefreshUserPlatformTokenMutation$data,
} from '@generated/registerRefreshUserPlatformTokenMutation.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

const URL_CONFIGS_OPENCTI = {
  custom_dashboard: 'deploy-custom-dashboard',
  csv_feed: 'deploy-csv-feed',
};

interface Props {
  platformBasePath: string;
  documentData: ShareableResource;
}

interface Return {
  openTab: () => void;
}

export const useOneClickDeployTab = ({
  platformBasePath,
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
  const url =
    documentData.type === ShareableResourceType.OPENAEV_SCENARIO
      ? `${platformBasePath}/admin/deploy-scenario/${documentData.service_instance?.id}/${documentData.id}`
      : `${platformBasePath}/dashboard/xtm-hub/${URL_CONFIGS_OPENCTI[documentData.type as keyof typeof URL_CONFIGS_OPENCTI]}/${documentData.service_instance?.id}/${documentData.id}`;
  const { openTab, postMessage } = useExternalTab({
    url,
    tabName:
      documentData.type === ShareableResourceType.OPENAEV_SCENARIO
        ? 'openaev-one-click-deploy'
        : 'opencti-one-click-deploy',
    onMessage: handleMessage,
    preventUnload: false,
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
