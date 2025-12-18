import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { useCsvFeedContext } from '@/components/service/csv-feeds/use-csv-feed-context';
import ShareableResourceConnectorSlug from '@/components/service/document/connector/shareable-resource-connector-slug';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';

import { SettingsContext } from '@/components/settings/env-portal-context';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { isConnectorResource } from '@/utils/shareable-resources/shareable-resources.types';

import {
  IntegrationQuery,
  integrationsItem,
} from '@/components/service/integrations/integration.graphql';
import { integrationQuery } from '@generated/integrationQuery.graphql';
import {
  integrationsItem_fragment$data,
  integrationsItem_fragment$key,
} from '@generated/integrationsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useContext } from 'react';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface IntegrationSlugProps {
  queryRef: PreloadedQuery<integrationQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const IntegrationSlug: React.FunctionComponent<IntegrationSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<integrationQuery>(IntegrationQuery, queryRef);
  const { settings } = useContext(SettingsContext);

  const documentData = readInlineData<integrationsItem_fragment$key>(
    integrationsItem,
    data.integration
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
            logo={`/document/images/${serviceInstance.id}/${(documentData as integrationsItem_fragment$data).children_documents?.[0]?.id}`}
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
export default IntegrationSlug;
