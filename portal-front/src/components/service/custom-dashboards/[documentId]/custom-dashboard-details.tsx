import * as React from 'react';

import {
  documentItem,
  DocumentQuery,
} from '@/components/service/document/document.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';

import DashboardCarousel from '@/components/service/custom-dashboards/[documentId]/custom-dashboard-carousel-view';
import DashboardUpdate from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
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
  const data = usePreloadedQuery<documentQuery>(DocumentQuery, queryRef);
  const documentData = readInlineData<customDashboardsItem_fragment$data>(
    documentItem,
    data.document
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

  return (
    documentData && (
      <ShareableResourceSlug
        breadcrumbValue={breadcrumbValue}
        documentData={documentData}
        updateActions={
          <DashboardUpdate
            serviceInstance={serviceInstance}
            customDashboard={documentData!}
          />
        }>
        <DashboardCarousel
          serviceInstance={serviceInstance}
          documentData={documentData}
        />
      </ShareableResourceSlug>
    )
  );
};

// Component export
export default DashboardSlug;
