import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { customDashboardQuery } from '@generated/customDashboardQuery.graphql';
import { customDashboardsItem_fragment$key } from '@generated/customDashboardsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
import {
  CustomDashboardQuery,
  customDashboardsItem,
} from '../custom-dashboard.graphql';

// Component interface
interface DashboardSlugProps {
  queryRef: PreloadedQuery<customDashboardQuery>;
  serviceInstance: serviceInstance_fragment$data;
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
      href: `/${APP_PATH}`,
    },
    {
      label: serviceInstance.name,
      href: `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`,
      original: true,
    },
    {
      label: documentData!.name!,
      original: true,
    },
  ];

  const context = useDocumentContext({
    serviceInstance,
    type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  });

  return (
    documentData && (
      <AppServiceContext {...context}>
        <ShareableResourceSlug
          breadcrumbValue={breadcrumbValue}
          documentData={documentData}
          updateActions={
            <ServiceManageSheet
              document={documentData}
              variant={'button'}
            />
          }>
          <DashboardCarousel
            serviceInstance={serviceInstance}
            documentData={documentData}
          />
        </ShareableResourceSlug>
      </AppServiceContext>
    )
  );
};

// Component export
export default DashboardSlug;
