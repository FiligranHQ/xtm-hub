import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import ShareableResourceDetails from '@/components/service/document/shareable-resouce-details';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import useDecodedParams from '@/hooks/useDecodedParams';
import useServiceCapability from '@/hooks/useServiceCapability';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

// Component interface
interface DashboardSlugProps {
  documentData: csvFeedItem_fragment$data;
  breadcrumbValue: BreadcrumbNavLink[];
  children: ReactNode;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const ShareableResourceSlug: React.FunctionComponent<DashboardSlugProps> = ({
  documentData,
  breadcrumbValue,
  children,
  serviceInstance,
}) => {
  const t = useTranslations();
  const { slug } = useDecodedParams();

  const [documentDownloadNumber, setDocumentDownloadNumber] = useState(
    documentData?.download_number ?? 0
  );

  const addDownloadNumber = () => {
    setDocumentDownloadNumber(documentDownloadNumber + 1);
  };

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s pb-l flex-col md:flex-row">
        <h1 className="whitespace-nowrap">{documentData?.name}</h1>

        <BadgeOverflowCounter
          badges={documentData?.labels as BadgeOverflow[]}
        />

        <ShareLinkButton
          documentId={documentData?.id ?? ''}
          url={`${window.location.origin}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${documentData?.service_instance?.slug}/${documentData?.slug}`}
        />

        <div className="flex items-center gap-2 ml-auto">
          {(userCanDelete || userCanUpdate) && (
            <DashboardUpdate
              userCanDelete={userCanDelete}
              userCanUpdate={userCanUpdate}
              serviceInstanceId={serviceInstance.id ?? ''}
              customDashboard={documentData!}
              connectionId={''}
            />
          )}
          <Button
            onClick={() => {
              addDownloadNumber();
              window.location.href = `/document/get/${slug}/${documentData?.id}`;
            }}>
            {t('Utils.Download')}
          </Button>
        </div>
      </div>
      {children}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <ShareableResourceDescription
          shortDescription={documentData?.short_description}
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
