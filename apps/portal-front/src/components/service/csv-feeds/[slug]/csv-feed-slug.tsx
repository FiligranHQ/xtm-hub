import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import {
  CsvFeedQuery,
  csvFeedsItem,
} from '@/components/service/csv-feeds/csv-feed.graphql';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { APP_PATH } from '@/utils/path/constant';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { csvFeedsItem_fragment$key } from '@generated/csvFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface CsvFeedSlugProps {
  queryRef: PreloadedQuery<csvFeedQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const CsvFeedSlug: React.FunctionComponent<CsvFeedSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<csvFeedQuery>(CsvFeedQuery, queryRef);

  const documentData = readInlineData<csvFeedsItem_fragment$key>(
    csvFeedsItem,
    data.csvFeed
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
export default CsvFeedSlug;
