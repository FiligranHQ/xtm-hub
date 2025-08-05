import { CSVFeedUpdateSheet } from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-update-sheet';
import {
  CsvFeedQuery,
  csvFeedsItem,
} from '@/components/service/csv-feeds/csv-feed.graphql';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { APP_PATH } from '@/utils/path/constant';
import { csvFeedQuery } from '@generated/csvFeedQuery.graphql';
import { csvFeedsItem_fragment$key } from '@generated/csvFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
  const t = useTranslations();

  const data = usePreloadedQuery<csvFeedQuery>(CsvFeedQuery, queryRef);
  const router = useRouter();

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

  const onDelete = () => {
    router.push(
      `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
    );
    toast({
      title: t('Utils.Success'),
      description: t('Service.CsvFeed.Actions.Deleted', {
        name: documentData!.name,
      }),
    });
  };

  return (
    documentData && (
      <ShareableResourceSlug
        breadcrumbValue={breadcrumbValue}
        documentData={documentData}
        updateActions={
          <CSVFeedUpdateSheet
            onDelete={onDelete}
            csvFeed={documentData}
            serviceInstance={serviceInstance}
          />
        }></ShareableResourceSlug>
    )
  );
};

// Component export
export default CsvFeedSlug;
