import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import ShareableResourceDetails from '@/components/service/document/shareable-resouce-details';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import { SettingsContext } from '@/components/settings/env-portal-context';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import useDecodedParams from '@/hooks/useDecodedParams';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.utils';
import { ReactNode, useContext } from 'react';
// Component interface
interface ShareableResourceSlugProps {
  documentData: ShareableResource;
  breadcrumbValue: BreadcrumbNavLink[];
  children?: ReactNode;
  updateActions?: ReactNode;
}

// Component
const ShareableResourceSlug: React.FunctionComponent<
  ShareableResourceSlugProps
> = ({ documentData, breadcrumbValue, children, updateActions }) => {
  const t = useTranslations();
  const { serviceInstanceId } = useDecodedParams();
  const { settings } = useContext(SettingsContext);

  const [documentDownloadNumber, setDocumentDownloadNumber] = useState(
    documentData.download_number
  );

  const incrementDownloadNumber = () => {
    setDocumentDownloadNumber(documentDownloadNumber + 1);
  };

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s pb-l flex-col md:flex-row">
        <h1 className="whitespace-nowrap">{documentData.name}</h1>

        <BadgeOverflowCounter badges={documentData.labels as BadgeOverflow[]} />

        <ShareLinkButton
          documentId={documentData.id}
          url={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${documentData?.service_instance?.slug}/${documentData?.slug}`}
        />

        <div className="flex items-center gap-2 ml-auto">
          {updateActions}
          <Button
            onClick={() => {
              incrementDownloadNumber();
              window.location.href = `/document/get/${serviceInstanceId}/${documentData?.id}`;
            }}>
            {t('Utils.Download')}
          </Button>
        </div>
      </div>
      {children}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <ShareableResourceDescription
          shortDescription={documentData?.short_description ?? ''}
          longDescription={documentData?.description ?? ''}
        />
        <div className="flex-1">
          <h2 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
            {t('Service.CustomDashboards.Details.BasicInformation')}
          </h2>
          <section className="border rounded border-border-light bg-page-background flex space-y-xl p-l">
            {documentData && (
              <ShareableResourceDetails
                documentData={documentData}
                downloadNumber={documentDownloadNumber}
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
};

// Component export
export default ShareableResourceSlug;
