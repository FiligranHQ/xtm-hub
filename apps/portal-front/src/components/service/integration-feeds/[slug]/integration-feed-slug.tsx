import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import ShareableResourceConnectorSlug from '@/components/service/document/connector/shareable-resource-connector-slug';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import {
  IntegrationFeedQuery,
  integrationFeedsItem,
} from '@/components/service/integration-feeds/integration-feed.graphql';
import { SettingsContext } from '@/components/settings/env-portal-context';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { isConnectorResource } from '@/utils/shareable-resources/shareable-resources.types';
import { integrationFeedQuery } from '@generated/integrationFeedQuery.graphql';
import {
  integrationFeedsItem_fragment$data,
  integrationFeedsItem_fragment$key,
} from '@generated/integrationFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useContext } from 'react';
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
  const { settings } = useContext(SettingsContext);

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
  const shareUrl = `${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${documentData?.service_instance?.slug}/${documentData?.slug}`;

  return (
    documentData && (
      <AppServiceContext {...context}>
        {isConnectorResource(documentData) ? (
          <ShareableResourceConnectorSlug
            breadcrumbValue={breadcrumbValue}
            documentData={documentData}
            shareUrl={shareUrl}
            logo={`/document/images/${serviceInstance.id}/${(documentData as integrationFeedsItem_fragment$data).children_documents?.[0]?.id}`}
          />
        ) : (
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
        )}
      </AppServiceContext>
    )
  );
};

// Component export
export default IntegrationFeedSlug;
