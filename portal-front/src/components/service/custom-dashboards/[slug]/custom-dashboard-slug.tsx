import * as React from 'react';

import {
  documentItem,
  DocumentQuery,
} from '@/components/service/document/document.graphql';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
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
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  return (
    documentData && (
      <ShareableResourceSlug
        breadcrumbValue={breadcrumbValue}
        documentData={documentData}
        updateActions={
          userCanDelete || userCanUpdate ? (
            <DashboardUpdate
              userCanDelete={userCanDelete}
              userCanUpdate={userCanUpdate}
              serviceInstanceId={serviceInstance.id ?? ''}
              customDashboard={documentData!}
              connectionId=""
            />
          ) : undefined
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
