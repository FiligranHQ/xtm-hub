import ShareableResourceSlug from '@/components/service/document/shareable-resource-slug';
import { ObasScenarioUpdateSheet } from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-update-sheet';
import {
  ObasScenarioQuery,
  obasScenariosItem,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { APP_PATH } from '@/utils/path/constant';
import { obasScenarioQuery } from '@generated/obasScenarioQuery.graphql';
import { obasScenariosItem_fragment$key } from '@generated/obasScenariosItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface ObasScenarioSlugProps {
  queryRef: PreloadedQuery<obasScenarioQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

// Component
const ObasScenarioSlug: React.FunctionComponent<ObasScenarioSlugProps> = ({
  queryRef,
  serviceInstance,
}) => {
  const t = useTranslations();

  const data = usePreloadedQuery<obasScenarioQuery>(
    ObasScenarioQuery,
    queryRef
  );
  const router = useRouter();

  const documentData = readInlineData<obasScenariosItem_fragment$key>(
    obasScenariosItem,
    data.obasScenario
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
      description: t('Service.ObasScenario.Actions.Deleted', {
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
          <ObasScenarioUpdateSheet
            onDelete={onDelete}
            obasScenario={documentData}
            serviceInstance={serviceInstance}
          />
        }></ShareableResourceSlug>
    )
  );
};

// Component export
export default ObasScenarioSlug;
