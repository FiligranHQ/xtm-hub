import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { CsvFeedQuery } from '@/components/service/csv-feeds/csv-feed.graphql';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import { documentBase } from '@/components/service/document/document.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { APP_PATH } from '@/utils/path/constant';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { documentBase_fragment$key } from '@generated/documentBase_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

interface CsvFeedSlugProps {
  queryRef: PreloadedQuery<csvFeedQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

const CsvFeedSlug = ({ queryRef, serviceInstance }: CsvFeedSlugProps) => {
  const data = usePreloadedQuery<csvFeedQuery>(CsvFeedQuery, queryRef);

  const documentData = readInlineData<documentBase_fragment$key>(
    documentBase,
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
