import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  onIntegrationTypeSelect: (integrationType: IntegrationTypeEnum) => void;
}

export const ServiceListIntegrationDropdown: React.FC<Props> = ({
  onIntegrationTypeSelect,
}) => {
  const t = useTranslations();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{t('Service.OpenctiIntegrations.AddService')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {t('Service.OpenctiIntegrations.IntegrationType')}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onIntegrationTypeSelect(IntegrationTypeEnum.CSV_FEED)}>
          {t(`Service.OpenctiIntegrations.Type.csv_feed`)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onIntegrationTypeSelect(IntegrationTypeEnum.TAXII_FEED)
          }>
          {t(`Service.OpenctiIntegrations.Type.taxii_feed`)}
        </DropdownMenuItem>

        <DropdownMenuItem disabled>
          {t(`Service.OpenctiIntegrations.Type.json_feed`)}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          {t(`Service.OpenctiIntegrations.Type.opencti_stream_feed`)}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          {t(`Service.OpenctiIntegrations.Type.third_party_integration`)}
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          {t(`Service.OpenctiIntegrations.Type.rss_feed`)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
