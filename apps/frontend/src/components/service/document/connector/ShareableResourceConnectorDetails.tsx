import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { ShareableResourceDetailsLink } from '@/components/service/document/ShareableResourceDetailsLink';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/ShareableResourceBasicInformation';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/ShareableResourceDetailItem';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/Integration.utils';
import { roundToNearest } from '@/lib/utils';
import { LogoGitIcon, OpenInNewIcon } from '@filigran/icon';
import { Badge, Button } from '@filigran/ui/servers';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as React from 'react';

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
    datasheet_url?: string | null;
    blogpost_url?: string | null;
    demo_url?: string | null;
    minimum_deployable_version?: string | null;
  };
  compatibilityItem?: React.ReactNode;
}

const CONNECTOR_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/external-connectors/';
export const ShareableResourceConnectorDetails = ({
  connectorDetails,
  compatibilityItem,
}: ShareableResourceConnectorDetailsProps) => {
  const t = useTranslations();
  const platformName = PlatformMetadataMapping[PlatformIdentifier.Opencti].name;
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
        label={t('Service.ShareableResources.Details.ProductVersion', {
          platform: platformName,
        })}>
        <span>{connectorDetails?.product_version}</span>
      </ShareableResourceDetailItem>
      {!!connectorDetails?.minimum_deployable_version && (
        <ShareableResourceDetailItem
          label={t(
            'Service.ShareableResources.Details.MinimumDeployableVersion',
            {
              platform: platformName,
            }
          )}>
          {compatibilityItem || (
            <span>{connectorDetails?.minimum_deployable_version}</span>
          )}
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.OpenCTIDocumentation')}>
        <ShareableResourceDetailsLink url={CONNECTOR_DOCUMENTATION} />
      </ShareableResourceDetailItem>

      {connectorDetails?.datasheet_url && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.DatasheetURL')}>
          <ShareableResourceDetailsLink url={connectorDetails.datasheet_url} />
        </ShareableResourceDetailItem>
      )}
      {connectorDetails?.blogpost_url && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.BlogpostURL')}>
          <ShareableResourceDetailsLink url={connectorDetails.blogpost_url} />
        </ShareableResourceDetailItem>
      )}
      {connectorDetails?.demo_url && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.DemoURL')}>
          <ShareableResourceDetailsLink url={connectorDetails.demo_url} />
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Shares')}>
        <span>{roundToNearest(connectorDetails.share_number)}</span>
      </ShareableResourceDetailItem>
    </ShareableResourceBasicInformation>
  );
};
