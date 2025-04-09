import { formatDate } from '@/utils/date';
import { LogoFiligranIcon } from 'filigran-icon';
import * as React from 'react';

import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Avatar, Label } from 'filigran-ui/clients';

import { roundToNearest } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// Component interface
interface DashboardDetailsProps {
  documentData: documentItem_fragment$data;
  downloadNumber?: number;
}

const DashboardDetails: React.FunctionComponent<DashboardDetailsProps> = ({
  documentData,
}) => {
  const t = useTranslations();
  return (
    <div className="space-y-xl">
      {!documentData.uploader_organization?.personal_space && (
        <div>
          <div>
            <Label className="block pb-s">{'Organization'}</Label>
            <div className="flex items-center gap-s mb-s">
              <LogoFiligranIcon className="size-8" />
              {/*By default, if the organization is undefined, we display Filigran*/}

              {`${documentData.uploader_organization?.name ?? 'Filigran'}`}
            </div>
          </div>
        </div>
      )}
      <div>
        <Label className="block pb-s">
          {t('Service.CustomDashboards.Details.Author')}
        </Label>

        <div className="flex items-center gap-s">
          <div className="size-8">
            <Avatar src={documentData.uploader?.picture ?? ''} />
          </div>
          <span>
            {`${documentData.uploader?.first_name}
                ${documentData.uploader?.last_name}`}
          </span>
        </div>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.CustomDashboards.Details.LastUpdatedAt')}
        </Label>
        <span>
          {formatDate(
            documentData.updated_at ?? documentData.created_at,
            'DATE_FULL'
          )}
        </span>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.CustomDashboards.Details.OpenCTIVersion')}
        </Label>
        <span>{documentData.product_version}</span>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.CustomDashboards.Details.Downloads')}
        </Label>
        <span>{roundToNearest(documentData.download_number ?? 0)}</span>
      </div>
      <div>
        <Label className="block pb-s">
          {t('Service.CustomDashboards.Details.Shares')}
        </Label>
        <span>{roundToNearest(documentData.share_number ?? 0)}</span>
      </div>
    </div>
  );
};

export default DashboardDetails;
