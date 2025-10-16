import { getIngestionConnectorMetadata } from '@/components/connectors/connector.utils';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/shareable-resource-detail-item';
import { integrationFeedConnectorsItem_fragment$data } from '@generated/integrationFeedConnectorsItem_fragment.graphql';
import { integrationFeedsItem_fragment$data } from '@generated/integrationFeedsItem_fragment.graphql';
import { LogoGitIcon, OpenInNewIcon } from 'filigran-icon';
import { Badge } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

interface Props {
  documentData: integrationFeedsItem_fragment$data;
  connector: integrationFeedConnectorsItem_fragment$data;
}

export const ShareableResourceConnectorDetails: React.FC<Props> = ({
  connector,
  documentData,
}) => {
  const t = useTranslations();

  const connectorMetadata = getIngestionConnectorMetadata(
    connector.integration_subtype
  );

  return (
    <>
      {connector.source_code && (
        <ShareableResourceDetailItem
          label={t('Service.Connectors.IntegrationDocumentationAndCode')}>
          <Button
            className="p-0"
            variant="link"
            asChild>
            <Link
              href={connector.source_code}
              target="_blank">
              <LogoGitIcon className="h-4 w-4 mr-s" />
              {documentData.name}
            </Link>
          </Button>
        </ShareableResourceDetailItem>
      )}
      {connector.subscription_link && (
        <ShareableResourceDetailItem
          label={t('Service.Connectors.VisitVendor')}>
          <Button
            className="p-0 uppercase"
            variant="link"
            asChild>
            <Link
              href={connector.subscription_link}
              rel="noopener noreferrer"
              target="_blank">
              <OpenInNewIcon className="h-4 w-4 mr-s" />
              {t('Service.Connectors.VendorContact')}
            </Link>
          </Button>
        </ShareableResourceDetailItem>
      )}
      {connectorMetadata && (
        <ShareableResourceDetailItem label={t('Service.Connectors.Type')}>
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
        <span>{connector.product_version}</span>
      </ShareableResourceDetailItem>
    </>
  );
};
