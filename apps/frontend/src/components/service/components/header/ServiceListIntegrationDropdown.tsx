import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { IntegrationType } from '@graphql/generated';

import { useTranslate } from '@tolgee/react';
interface ServiceListIntegrationDropdownProps {
  onIntegrationTypeSelect: (integrationType: IntegrationType) => void;
}

export const ServiceListIntegrationDropdown = ({
  onIntegrationTypeSelect,
}: ServiceListIntegrationDropdownProps) => {
  const { t } = useTranslate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{t('Service_OpenctiIntegrations_AddService')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {t('Service_OpenctiIntegrations_IntegrationType')}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onIntegrationTypeSelect(IntegrationType.CsvFeed)}>
          {t(`Service_OpenctiIntegrations_Type_csv_feed`)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onIntegrationTypeSelect(IntegrationType.TaxiiFeed)}>
          {t(`Service_OpenctiIntegrations_Type_taxii_feed`)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onIntegrationTypeSelect(IntegrationType.Stream)}>
          {t(`Service_OpenctiIntegrations_Type_stream`)}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            onIntegrationTypeSelect(IntegrationType.ThirdPartyIntegration)
          }>
          {t(`Service_OpenctiIntegrations_Type_third_party_integration`)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onIntegrationTypeSelect(IntegrationType.RssFeed)}>
          {t(`Service_OpenctiIntegrations_Type_rss_feed`)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
