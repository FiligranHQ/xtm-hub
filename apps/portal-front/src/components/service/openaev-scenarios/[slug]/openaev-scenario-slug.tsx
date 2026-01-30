import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';

import ShareableResourceCarousel from '@/components/service/document/ui/shareable-resource-carousel-view';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import DeleteIntegrationSlug from '@/components/service/integrations/[slug]/delete-integration-slug';
import {
  OpenaevScenarioQuery,
  openaevScenariosItem,
} from '@/components/service/openaev-scenarios/openaev-scenario.graphql';
import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { openaevScenarioQuery } from '@generated/openaevScenarioQuery.graphql';
import { openaevScenariosItem_fragment$key } from '@generated/openaevScenariosItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

interface OpenAEVScenarioSlugProps {
  queryRef: PreloadedQuery<openaevScenarioQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

const OpenaevScenarioSlug = ({
  queryRef,
  serviceInstance,
}: OpenAEVScenarioSlugProps) => {
  const data = usePreloadedQuery<openaevScenarioQuery>(
    OpenaevScenarioQuery,
    queryRef
  );

  const documentData = readInlineData<openaevScenariosItem_fragment$key>(
    openaevScenariosItem,
    data.openAEVScenario
  );

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: serviceInstance.name,
      href: `/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`,
      original: true,
    },
    {
      label: documentData!.name!,
      original: true,
    },
  ];

  const context = useDocumentContext({
    serviceInstance,
    type: ShareableResourceType.OPENAEV_SCENARIO,
  });

  return (
    documentData && (
      <AppServiceContext {...context}>
        <ShareableResourceSlug
          breadcrumbValue={breadcrumbValue}
          documentData={documentData}
          updateActions={
          <>
            <DeleteIntegrationSlug document={documentData} />
            <ServiceManageSheet
              document={documentData}
              variant={'button'}
            />
          </>
          }>
          <ShareableResourceCarousel
            serviceInstance={serviceInstance}
            documentData={documentData}
          />
        </ShareableResourceSlug>
      </AppServiceContext>
    )
  );
};

// Component export
export default OpenaevScenarioSlug;
