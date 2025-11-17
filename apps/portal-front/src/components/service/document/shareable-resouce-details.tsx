import { formatDate } from '@/utils/date';
import { LogoFiligranIcon } from 'filigran-icon';
import * as React from 'react';

import { Avatar } from 'filigran-ui/clients';

import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import { ShareableResourceDetailItem } from '@/components/service/document/ui/shareable-resource-detail-item';
import { roundToNearest } from '@/lib/utils';
import { formatPersonNames } from '@/utils/format/name';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { useTranslations } from 'next-intl';

// Component interface
interface ShareableResourceDetailsProps {
  documentData: ShareableResource;
  downloadNumber?: number;
}

const ShareableResourceDetails: React.FunctionComponent<
  ShareableResourceDetailsProps
> = ({ documentData, downloadNumber }) => {
  const t = useTranslations();
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
      <ShareableResourceDetailItem
        label={t('Service.ShareableResources.Details.LastUpdatedAt')}>
        <span>
          {formatDate(
            documentData.updated_at ?? documentData.created_at,
            'DATE_FULL'
          )}
        </span>
      </ShareableResourceDetailItem>
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
