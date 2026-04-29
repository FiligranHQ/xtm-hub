import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { Button } from '@filigran/ui';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { IconActionsItem } from '@/components/ui/IconActions';

interface ServiceDeleteProps {
  userCanDelete?: boolean;
  onDelete?: () => void;
  serviceName: string;
  integrationType: CardTypeEnum;
  type?: 'menuitem' | 'button';
}

export type CardTypeEnum = IntegrationTypeEnum | ShareableResourceType;

const INTEGRATION_TRANSLATION_KEY_MAP: Partial<Record<CardTypeEnum, string>> = {
  [IntegrationTypeEnum.CSV_FEED]: 'CsvFeed',
  [IntegrationTypeEnum.CONNECTOR]: 'Connector',
  [IntegrationTypeEnum.TAXII_FEED]: 'TaxiiFeed',
  [IntegrationTypeEnum.RSS_FEED]: 'RssFeed',
  [IntegrationTypeEnum.STREAM]: 'Stream',
  [IntegrationTypeEnum.THIRD_PARTY_INTEGRATION]: 'ThirdPartyIntegration',
  [ShareableResourceType.OPENAEV_SCENARIO]: 'OpenAEVScenario',
  [ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD]: 'OpenctiCustomDashboards',
};

export const ServiceDelete = ({
  userCanDelete,
  onDelete,
  serviceName,
  integrationType,
  type = 'button',
}: ServiceDeleteProps) => {
  const t = useTranslations();
  const translationKey =
    INTEGRATION_TRANSLATION_KEY_MAP[integrationType] ?? 'CsvFeed';

  return (
    userCanDelete && (
      <AlertDialogComponent
        actionButtonText={t('Utils.Delete')}
        variantName={'destructive'}
        AlertTitle={t(`Service.${translationKey}.DeleteService`, {
          name: serviceName,
        })}
        triggerElement={
          type === 'menuitem' ? (
            <IconActionsItem
              onSelect={(e) => {
                e.preventDefault();
              }}>
              {t('Utils.Delete')}
            </IconActionsItem>
          ) : (
            <Button variant={'outline-destructive'}>{t('Utils.Delete')}</Button>
          )
        }
        onClickContinue={() => {
          onDelete?.();
        }}>
        {t(`Service.${translationKey}.SureDeleteService`, {
          name: serviceName,
        })}
      </AlertDialogComponent>
    )
  );
};
