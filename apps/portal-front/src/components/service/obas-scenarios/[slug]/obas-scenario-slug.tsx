import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';

import {
  OpenAEVScenarioQuery,
  openAEVScenariosItem,
} from '@/components/service/obas-scenarios/openAEV-scenario.graphql';
import { useObasScenarioContext } from '@/components/service/obas-scenarios/use-obas-scenario-context';
import { APP_PATH } from '@/utils/path/constant';
import { openAEVScenarioQuery } from '@generated/openAEVScenarioQuery.graphql';
import { openAEVScenariosItem_fragment$key } from '@generated/openAEVScenariosItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface ObasScenarioSlugProps {
  queryRef: PreloadedQuery<openAEVScenarioQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const ObasScenarioSlug: React.FunctionComponent<ObasScenarioSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<openAEVScenarioQuery>(
    OpenAEVScenarioQuery,
    queryRef
  );

  const documentData = readInlineData<openAEVScenariosItem_fragment$key>(
    openAEVScenariosItem,
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

  const context = useObasScenarioContext(serviceInstance);
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
export default ObasScenarioSlug;
