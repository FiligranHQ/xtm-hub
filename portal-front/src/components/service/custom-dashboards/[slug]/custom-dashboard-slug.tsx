import * as React from 'react';

import {
  documentItem,
  DocumentQuery,
} from '@/components/service/document/document.graphql';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';

import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
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
  const documentData = readInlineData<documentItem_fragment$key>(
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
    <ShareableResourceSlug
      breadcrumbValue={breadcrumbValue}
      documentData={documentData}
      serviceInstance={serviceInstance}>
      {documentData && (
        <DashboardCarousel
          serviceInstance={serviceInstance}
          documentData={documentData}
        />
      )}
    </ShareableResourceSlug>
  );
};

// Component export
export default DashboardSlug;
