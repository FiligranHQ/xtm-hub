import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';

import { documentBase } from '@/components/service/document/document.graphql';
import { OpenaevScenarioQuery } from '@/components/service/openaev-scenarios/openaev-scenario.graphql';
import { useOpenaevScenarioContext } from '@/components/service/openaev-scenarios/use-openaev-scenario-context';
import { APP_PATH } from '@/utils/path/constant';
import { documentBase_fragment$key } from '@generated/documentBase_fragment.graphql';
import { openaevScenarioQuery } from '@generated/openaevScenarioQuery.graphql';
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

  const documentData = readInlineData<documentBase_fragment$key>(
    documentBase,
    data.openAEVScenario
  );

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: serviceInstance.name,
      // Temp fix, add service definition identifier when obas new name will be released
      href: `/${APP_PATH}/service/obas_scenarios/${serviceInstance.id}`,
      original: true,
    },
    {
      label: documentData!.name!,
      original: true,
    },
  ];

  const context = useOpenaevScenarioContext(serviceInstance);
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
export default OpenaevScenarioSlug;
