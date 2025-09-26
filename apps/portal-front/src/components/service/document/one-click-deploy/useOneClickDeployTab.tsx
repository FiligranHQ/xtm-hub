import { RefreshUserPlatformTokenMutation } from '@/components/registration/register/register.graphql';
import { ShareableResourceType } from '@/components/service/document/shareable-resource-slug';
import useExternalTab from '@/hooks/useExternalTab';
import { ShareableResourceSlugType } from '@/utils/shareable-resources/shareable-resources.types';
import {
  registerRefreshUserPlatformTokenMutation,
  registerRefreshUserPlatformTokenMutation$data,
} from '@generated/registerRefreshUserPlatformTokenMutation.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';

const OPENCTI_URL_CONFIGS = {
  custom_dashboard: 'deploy-custom-dashboard',
  csv_feed: 'deploy-csv-feed',
};

interface Props {
  platformBasePath: string;
  documentData: ShareableResourceSlugType;
}

interface Return {
  openTab: () => void;
}

function computeDeployUrl(
  documentData: ShareableResourceSlugType,
  platformBasePath: string
): string {
  const { id, service_instance, type } = documentData;

  if (type === ShareableResourceType.OPENAEV_SCENARIO) {
    return `${platformBasePath}/admin/deploy-scenario/${service_instance?.id}/${id}`;
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
