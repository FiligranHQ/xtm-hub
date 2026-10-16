import {
  getHuntPlatformName,
  humanizeIdentifier,
  isConnectorType,
} from '@/components/service/integrations/connector-type/connector-type.utils';
import { useTranslate } from '@/hooks/use-translate';
import { useMemo } from 'react';

export const useConnectorTypeLabels = () => {
  const t = useTranslate();

  return useMemo(
    () => ({
      connectorTypeLabel: (connectorType: string): string =>
        isConnectorType(connectorType)
          ? t(`Service.OpenctiIntegrations.ConnectorType.${connectorType}`)
          : humanizeIdentifier(connectorType),
      huntPlatformLabel: getHuntPlatformName,
    }),
    [t]
  );
};
