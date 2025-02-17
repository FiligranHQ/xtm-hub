import { LogoFiligranIcon } from 'filigran-icon';
import * as React from 'react';

import {
  documentItem,
  DocumentQuery,
} from '@/components/service/document/document.graphql';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import GuardCapacityComponent from '@/components/admin-guard';
import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import DashboardDetails from '@/components/service/custom-dashboards/[details]/custom-dashboard-details';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import { RESTRICTION } from '@/utils/constant';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
// Component interface
interface DashboardSlugProps {
  queryRef: PreloadedQuery<documentQuery>;
  serviceInstance: serviceByIdQuery$data;
}

// Component
const DashboardSlug: React.FunctionComponent<DashboardSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const t = useTranslations();

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
      label: serviceInstance?.serviceInstanceById?.name,
      href: `/service/custom_dashboards/${serviceInstance?.serviceInstanceById?.id}`,
    },
    {
      label: documentData?.name,
      original: true,
    },
  ];

  const addDownloadNumber = () => {
    setDocumentDownloadNumber(documentDownloadNumber + 1);
  };
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />

      <div className="flex items-center gap-2">
        <h1 className="sr-only">{documentData?.name}</h1>

        <Button
          className="ml-auto"
          onClick={() => {
            addDownloadNumber();
            window.location.href = `/document/get/${serviceInstance?.serviceInstanceById?.id}/${documentData?.id}`;
          }}>
          {t('Utils.Download')}
        </Button>
        <GuardCapacityComponent
          capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
          <DashboardUpdate
            serviceInstanceId={serviceInstance.serviceInstanceById?.id ?? ''}
            customDashboard={documentData!}
            data={data as unknown as documentItem_fragment$key}
            connectionId={''}
          />
        </GuardCapacityComponent>
      </div>

      <div className="flex w-full mt-l">
        <div className=" w-3/4">
          {documentData && (
            <DashboardCarousel
              serviceInstance={serviceInstance}
              documentData={documentData}></DashboardCarousel>
          )}
          <div className="flex items-center p-l txt-title">
            <LogoFiligranIcon className="size-10 mr-l" />
            {documentData?.name}
          </div>
          <h2 className="p-l">{documentData?.short_description}</h2>
          <div className="flex justify-center p-l">
            {documentData?.description}
          </div>
        </div>
        {documentData && (
          <DashboardDetails
            documentData={documentData}
            downloadNumber={documentDownloadNumber}
          />
        )}
      </div>
    </>
  );
};

// Component export
export default DashboardSlug;
