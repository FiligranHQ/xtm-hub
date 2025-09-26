import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import { useCustomDashboardsContext } from '@/components/service/custom-dashboards/use-custom-dashboards-context';
import { documentBase } from '@/components/service/document/document.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { APP_PATH } from '@/utils/path/constant';
import { customDashboardQuery } from '@generated/customDashboardQuery.graphql';
import { documentBase_fragment$key } from '@generated/documentBase_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
import { CustomDashboardQuery } from '../custom-dashboard.graphql';

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
  const documentData = readInlineData<documentBase_fragment$key>(
    documentBase,
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

  const context = useCustomDashboardsContext(serviceInstance);
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
