import { formatDate } from '@/utils/date';
import { LogoFiligranIcon } from '@filigran/icon';
import { useMemo } from 'react';

import { Avatar } from '@filigran/ui/clients';

import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { ShareableResourceDetailsLink } from '@/components/service/document/ShareableResourceDetailsLink';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/ShareableResourceBasicInformation';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/ShareableResourceDetailItem';
import { ShareableResourceDetailMetadataItem } from '@/components/service/document/ui/ShareableResourceDetailMetadataItem';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/Integration.utils';
import { roundToNearest } from '@/lib/utils';
import { formatPersonNames } from '@/utils/format/name';
import { platformIdentifierMappedByShareableResourceType } from '@/utils/services';
import {
  isIntegrationItem,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { isResourceDownloadable } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Badge } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { useTranslations } from 'next-intl';

// Component interface
interface ShareableResourceDetailsProps {
  documentData: documentItem_fragment$data | publicDocumentItemFragment$data;
  downloadNumber?: number | null;
}

const CSV_FEED_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/csv-feed/';
const STREAM_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/internal-streams/';
const TAXII_FEED_DOCUMENTATION =
  'https://docs.opencti.io/latest/usage/import/taxii-feed/';

const DOCUMENTATION_URLS: Partial<Record<IntegrationTypeEnum, string>> = {
  [IntegrationTypeEnum.CSV_FEED]: CSV_FEED_DOCUMENTATION,
  [IntegrationTypeEnum.STREAM]: STREAM_DOCUMENTATION,
  [IntegrationTypeEnum.TAXII_FEED]: TAXII_FEED_DOCUMENTATION,
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
          <ShareableResourceDetailItem label={'Organization'}>
            <div className="flex items-center gap-s mb-s">
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
        metadataKey={DocumentMetadataKeyCodeEnum.FEED_URL}
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
        metadataKey={DocumentMetadataKeyCodeEnum.VENDOR_URL}
        translationKey="VendorURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCodeEnum.GITHUB_URL}
        translationKey="GithubURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={'product_version'}
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
        metadataKey={DocumentMetadataKeyCodeEnum.DATASHEET_URL}
        translationKey="DatasheetURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCodeEnum.BLOGPOST_URL}
        translationKey="BlogpostURL"
        variant="link"
      />
      <ShareableResourceDetailMetadataItem
        documentData={documentData}
        metadataKey={DocumentMetadataKeyCodeEnum.DEMO_URL}
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
