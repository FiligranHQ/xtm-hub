import { AppServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import {
  ObasScenarioQuery,
  obasScenariosItem,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { useObasScenarioContext } from '@/components/service/obas-scenarios/use-obas-scenario-context';
import { APP_PATH } from '@/utils/path/constant';
import { obasScenarioQuery } from '@generated/obasScenarioQuery.graphql';
import { obasScenariosItem_fragment$key } from '@generated/obasScenariosItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface ObasScenarioSlugProps {
  queryRef: PreloadedQuery<obasScenarioQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const ObasScenarioSlug: React.FunctionComponent<ObasScenarioSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const data = usePreloadedQuery<obasScenarioQuery>(
    ObasScenarioQuery,
    queryRef
  );

  const documentData = readInlineData<obasScenariosItem_fragment$key>(
    obasScenariosItem,
    data.openAEVScenario
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
