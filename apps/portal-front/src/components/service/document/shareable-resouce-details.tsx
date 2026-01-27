import { formatDate } from '@/utils/date';
import { LogoFiligranIcon } from '@filigran/icon';
import * as React from 'react';

import { Avatar } from '@filigran/ui/clients';

import { ShareableResourceDetailsLink } from '@/components/service/document/shareable-resource-details-link';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/shareable-resource-detail-item';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { roundToNearest } from '@/lib/utils';
import { formatPersonNames } from '@/utils/format/name';
import {
  isIntegrationItem,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Badge } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

// Component interface
interface ShareableResourceDetailsProps {
  documentData: ShareableResource;
  downloadNumber?: number;
}

const ShareableResourceDetails: React.FunctionComponent<
  ShareableResourceDetailsProps
> = ({ documentData, downloadNumber }) => {
  const t = useTranslations();
  const isIntegration = isIntegrationItem(documentData);
  const integrationSubTypeMetadata = useMemo(() => {
    if (!isIntegration) {
      return null;
    }

    return getIntegrationSubTypeMetadata(documentData.integration_subtype);
  }, [isIntegration, documentData]);

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
          <div className="size-8">
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
      {docHasMetadata(documentData, 'feed_url') && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.FeedURL')}>
          <ShareableResourceDetailsLink url={documentData.feed_url} />
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.LastUpdatedAt')}>
        <span>
          {formatDate(
            documentData.updated_at ?? documentData.created_at,
            'DATE_FULL'
          )}
        </span>
      </ShareableResourceDetailItem>
      {docHasMetadata(documentData, 'vendor_url') && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.VendorURL')}>
          <ShareableResourceDetailsLink url={documentData.vendor_url} />
        </ShareableResourceDetailItem>
      )}
      {docHasMetadata(documentData, 'github_url') && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.GithubURL')}>
          <ShareableResourceDetailsLink url={documentData.github_url} />
        </ShareableResourceDetailItem>
      )}
      {docHasMetadata(documentData, 'product_version') && (
        <ShareableResourceDetailItem
          label={t('Service.ShareableResources.Details.ProductVersion')}>
          <span>{documentData.product_version}</span>
        </ShareableResourceDetailItem>
      )}
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Downloads')}>
        <span>{roundToNearest(downloadNumber)}</span>
      </ShareableResourceDetailItem>
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.Shares')}>
        <span>{roundToNearest(documentData.share_number ?? 0)}</span>
      </ShareableResourceDetailItem>
    </ShareableResourceBasicInformation>
  );
};

export default ShareableResourceDetails;
