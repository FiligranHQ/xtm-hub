import DashboardUpdate from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update';
import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { customDashboardQuery } from '@generated/customDashboardQuery.graphql';
import { customDashboardsItem_fragment$key } from '@generated/customDashboardsItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
import {
  CustomDashboardQuery,
  customDashboardsItem,
} from '../custom-dashboard.graphql';

// Component interface
interface DashboardSlugProps {
  queryRef: PreloadedQuery<customDashboardQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const DashboardSlug: React.FunctionComponent<DashboardSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<customDashboardQuery>(
    CustomDashboardQuery,
    queryRef
  );
  const documentData = readInlineData<customDashboardsItem_fragment$key>(
    customDashboardsItem,
    data.customDashboard
  );

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: serviceInstance.name,
      href: `/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`,
      original: true,
    },
    {
      label: documentData!.name!,
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
