import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import {
  IntegrationFeedQuery,
  integrationFeedsItem,
} from '@/components/service/integration-feeds/integration-feed.graphql';
import { APP_PATH } from '@/utils/path/constant';
import { integrationFeedQuery } from '@generated/integrationFeedQuery.graphql';
import { integrationFeedsItem_fragment$key } from '@generated/integrationFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface CsvFeedSlugProps {
  queryRef: PreloadedQuery<integrationFeedQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const IntegrationFeedSlug: React.FunctionComponent<CsvFeedSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<integrationFeedQuery>(
    IntegrationFeedQuery,
    queryRef
  );

  const documentData = readInlineData<integrationFeedsItem_fragment$key>(
    integrationFeedsItem,
    data.integrationFeed
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

  const context = useCsvFeedContext(serviceInstance);
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
          }
        />
      </AppServiceContext>
    )
  );
};

// Component export
export default IntegrationFeedSlug;
