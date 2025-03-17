import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import * as React from 'react';

import {
  documentItem,
  DocumentQuery,
} from '@/components/service/document/document.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import DashboardDetails from '@/components/service/custom-dashboards/[details]/custom-dashboard-details';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import useDecodedParams from '@/hooks/useDecodedParams';
import useServiceCapability from '@/hooks/useServiceCapability';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface DashboardSlugProps {
  queryRef: PreloadedQuery<documentQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const DashboardSlug: React.FunctionComponent<DashboardSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const { slug } = useDecodedParams();

  const data = usePreloadedQuery<documentQuery>(DocumentQuery, queryRef);
  const documentData = readInlineData<documentItem_fragment$key>(
    documentItem,
    data.document
  );

  const [documentDownloadNumber, setDocumentDownloadNumber] = useState(
    documentData?.download_number ?? 0
  );

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: serviceInstance?.name,
      href: `/service/custom_dashboards/${serviceInstance?.id}`,
      original: true,
    },
    {
      label: documentData?.name,
      original: true,
    },
  ];

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
      {documentData && (
        <DashboardCarousel
          serviceInstance={serviceInstance}
          documentData={documentData}
        />
      )}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <div className="flex-[3_3_0%]">
          <h3 className="py-s txt-container-title truncate text-muted-foreground">
            {t('Service.CustomDashboards.Details.Overview')}
          </h3>
          <section
            data-color-mode={theme}
            className="border rounded border-border-light bg-page-background">
            <h2 className="p-l">{documentData?.short_description}</h2>
            <MDEditor.Markdown
              className="p-l !bg-page-background"
              source={documentData?.description ?? ''}
            />
          </section>
        </div>
        <div className="flex-1">
          <h3 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
            {t('Service.CustomDashboards.Details.BasicInformation')}
          </h3>
          <section className="border rounded border-border-light bg-page-background flex space-y-xl p-l">
            {documentData && (
              <DashboardDetails
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
export default DashboardSlug;
