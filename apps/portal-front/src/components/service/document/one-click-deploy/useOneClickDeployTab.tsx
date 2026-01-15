import { RefreshUserPlatformTokenMutation } from '@/components/registration/register/register.graphql';
import useExternalTab from '@/hooks/useExternalTab';
import {
  isConnectorResource,
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { toast } from '@filigran/ui';
import {
  registerRefreshUserPlatformTokenMutation,
  registerRefreshUserPlatformTokenMutation$data,
} from '@generated/registerRefreshUserPlatformTokenMutation.graphql';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

const OPENCTI_URL_CONFIGS = {
  opencti_custom_dashboard: 'deploy-custom-dashboard',
  opencti_integration: 'deploy-csv-feed',
};

interface Props {
  platformBasePath: string;
  documentData: ShareableResource;
}

interface Return {
  openTab: () => void;
}

function computeDeployUrl(
  documentData: ShareableResource,
  platformBasePath: string
): string {
  const { id, service_instance, type } = documentData;

  if (type === ShareableResourceType.OPENAEV_SCENARIO) {
    return `${platformBasePath}/admin/deploy-scenario/${service_instance?.id}/${id}`;
  }

  if (isConnectorResource(documentData)) {
    return `${platformBasePath}/dashboard/xtm-hub/deploy-connector/${documentData.slug}?openConfig=true`;
  }

  const urlKey = OPENCTI_URL_CONFIGS[type as keyof typeof OPENCTI_URL_CONFIGS];
  return `${platformBasePath}/dashboard/xtm-hub/${urlKey}/${service_instance?.id}/${id}`;
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
  const url = computeDeployUrl(documentData, platformBasePath);
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
