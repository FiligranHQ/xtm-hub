import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { ShareableResourceDetailsLink } from '@/components/service/document/ShareableResourceDetailsLink';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/ShareableResourceBasicInformation';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/ShareableResourceDetailItem';
import { ShareableResourceDetailMetadataItem } from '@/components/service/document/ui/ShareableResourceDetailMetadataItem';
import {
  getEntityTypes,
  ShareableResourceEntityTypes,
} from '@/components/service/document/ui/ShareableResourceEntityTypes';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/Integration.utils';
import { roundToNearest } from '@/lib/utils';
import { formatDate } from '@/utils/date';
import { formatPersonNames } from '@/utils/format/name';
import { platformIdentifierMappedByShareableResourceType } from '@/utils/services';
import {
  isIntegrationItem,
  PublicDocumentDetailsData,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { isResourceDownloadable } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { LogoFiligranIcon } from '@filigran/icon';
import { Avatar } from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCode, IntegrationType } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface ShareableResourceDetailsProps {
  documentData: documentItem_fragment$data | PublicDocumentDetailsData;
  downloadNumber?: number | null;
}

const CSV_FEED_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/csv-feed/';
const STREAM_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/internal-streams/';
const TAXII_FEED_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/taxii-feed/';

const DOCUMENTATION_URLS: Partial<Record<IntegrationType, string>> = {
  [IntegrationType.CsvFeed]: CSV_FEED_DOCUMENTATION,
  [IntegrationType.Stream]: STREAM_DOCUMENTATION,
  [IntegrationType.TaxiiFeed]: TAXII_FEED_DOCUMENTATION,
};

const ShareableResourceDetails = ({
  documentData,
  downloadNumber,
}: ShareableResourceDetailsProps) => {
  const t = useTranslations();
  const platformIdentifier =
    platformIdentifierMappedByShareableResourceType[
      documentData.type as ShareableResourceType
    ];
  const platformName = PlatformMetadataMapping[platformIdentifier].name;
  const isIntegration = isIntegrationItem(documentData);

  const integrationSubTypeMetadata = useMemo(() => {
    if (!isIntegration) {
      return null;
    }

    return getIntegrationSubTypeMetadata(documentData.integration_subtype);
  }, [isIntegration, documentData]);

  const documentationUrl =
    documentData.integration_type &&
    DOCUMENTATION_URLS[documentData.integration_type];

  return (
    <ShareableResourceBasicInformation>
      {!documentData.uploader_organization?.personal_space && (
        <div>
          <ShareableResourceDetailItem label="Organization">
            <div className="mb-s flex items-center gap-s">
              <LogoFiligranIcon className="size-8" />
              {/*By default, if the organization is undefined, we display Filigran*/}

              {`${documentData.uploader_organization?.name ?? 'Filigran'}`}
            </div>
          </ShareableResourceDetailItem>
        </div>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Author')}>
        <div className="flex items-center gap-s">
          <div className="size-8 [&_img]:object-cover">
            <Avatar src={documentData.uploader?.picture ?? ''} />
          </div>
          <span>{formatPersonNames(documentData.uploader)}</span>
        </div>
      </ShareableResourceDetailItem>
      {getEntityTypes(documentData).length > 0 && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.EntityType')}>
          <ShareableResourceEntityTypes document={documentData} />
        </ShareableResourceDetailItem>
      )}
      {isIntegration && (
        <>
          <ShareableResourceDetailItem
            label={t('Service.ShareableResources.Details.IntegrationType')}>
            <div className="flex items-center gap-s">
              <span>
                {t(
                  `Service.OpenctiIntegrations.Type.${documentData.integration_type}`
                )}
              </span>
            </div>
          </ShareableResourceDetailItem>
          {integrationSubTypeMetadata && (
            <ShareableResourceDetailItem
              label={t(
                'Service.ShareableResources.Details.IntegrationSubType'
              )}>
              <span>
                <Badge
                  className="mr-auto"
                  variant="outline"
                  color={integrationSubTypeMetadata.color}>
                  {integrationSubTypeMetadata.label}
                </Badge>
              </span>
            </ShareableResourceDetailItem>
          )}
        </>
      )}
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.FeedUrl}
        translationKey="FeedURL"
        variant="link"
      />
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.LastUpdatedAt')}>
        <span>
          {formatDate(
            documentData.updated_at ?? documentData.created_at,
            'DATE_FULL'
          )}
        </span>
      </ShareableResourceDetailItem>
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.VendorUrl}
        translationKey="VendorURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.GithubUrl}
        translationKey="GithubURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey="product_version"
        translationKey="ProductVersion"
        translationMetadata={{ platform: platformName }}
        variant="text"
      />
      {documentationUrl && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.OpenCTIDocumentation')}>
          <ShareableResourceDetailsLink url={documentationUrl} />
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.DatasheetUrl}
        translationKey="DatasheetURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.BlogpostUrl}
        translationKey="BlogpostURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCode.DemoUrl}
        translationKey="DemoURL"
        variant="link"
      />
      {isResourceDownloadable(documentData) && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.Downloads')}>
          <span>{roundToNearest(downloadNumber)}</span>
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Shares')}>
        <span>{roundToNearest(documentData.share_number)}</span>
      </ShareableResourceDetailItem>
    </ShareableResourceBasicInformation>
  );
};

export default ShareableResourceDetails;
