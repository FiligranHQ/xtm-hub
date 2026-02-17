import { ShareableResourceDetailsLink } from '@/components/service/document/shareable-resource-details-link';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/shareable-resource-detail-item';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { roundToNearest } from '@/lib/utils';
import { LogoGitIcon, OpenInNewIcon } from '@filigran/icon';
import { Badge, Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as React from 'react';
import { FunctionComponent } from 'react';

export interface ShareableResourceConnectorDetailsProps {
  connectorDetails: {
    name: string;
    source_code?: string | null;
    subscription_link?: string | null;
    integration_type?: string | null;
    integration_subtype?: string | null;
    product_version?: string | null;
    share_number?: number | null;
    manager_supported?: boolean;
  };
  compatibilityItem?: React.ReactNode;
}

const CONNECTOR_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/external-connectors/';
export const ShareableResourceConnectorDetails: FunctionComponent<
  ShareableResourceConnectorDetailsProps
> = ({ connectorDetails, compatibilityItem }) => {
  const t = useTranslations();

  const connectorMetadata = getIntegrationSubTypeMetadata(
    connectorDetails?.integration_subtype ?? undefined
  );

  return (
    <ShareableResourceBasicInformation>
      {connectorDetails.source_code && (
        <ShareableResourceDetailItem
          label={t('Service.Connectors.IntegrationDocumentationAndCode')}>
          <Button
            className="p-0"
            variant="link"
            asChild>
            <Link
              href={connectorDetails.source_code}
              target="_blank">
              <LogoGitIcon className="h-4 w-4 mr-s" />
              {connectorDetails.name}
            </Link>
          </Button>
        </ShareableResourceDetailItem>
      )}
      {connectorDetails.subscription_link && (
        <ShareableResourceDetailItem
          label={t('Service.Connectors.VisitVendor')}>
          <Button
            className="p-0 uppercase"
            variant="link"
            asChild>
            <Link
              href={connectorDetails.subscription_link}
              rel="noopener noreferrer"
              target="_blank">
              <OpenInNewIcon className="h-4 w-4 mr-s" />
              {t('Service.Connectors.VendorContact')}
            </Link>
          </Button>
        </ShareableResourceDetailItem>
      )}
      {connectorDetails.integration_type && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.IntegrationType')}>
          <div className="flex items-center gap-s">
            <span>
              {t(
                `Service.OpenctiIntegrations.Type.${connectorDetails.integration_type}`
              )}
            </span>
          </div>
        </ShareableResourceDetailItem>
      )}
      {connectorMetadata && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.IntegrationSubType')}>
          <span>
            <Badge
              className="mr-auto"
              variant="outline"
              color={connectorMetadata.color}>
              {connectorMetadata.label}
            </Badge>
          </span>
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.ProductVersion')}>
        {compatibilityItem || <span>{connectorDetails?.product_version}</span>}
      </ShareableResourceDetailItem>
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.OpenCTIDocumentation')}>
        <ShareableResourceDetailsLink url={CONNECTOR_DOCUMENTATION} />
      </ShareableResourceDetailItem>
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Shares')}>
        <span>{roundToNearest(connectorDetails.share_number ?? 0)}</span>
      </ShareableResourceDetailItem>
    </ShareableResourceBasicInformation>
  );
};
