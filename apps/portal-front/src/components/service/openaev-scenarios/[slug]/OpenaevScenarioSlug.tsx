import { AppServiceContext } from '../../components/ServiceContext';
import { ServiceManageSheet } from '../../components/ServiceManageSheet';
import ShareableResourceSlug from '../../document/ShareableResourceSlug';

import {
  documentItem,
  DocumentsItemQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { APP_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';
import DeleteIntegrationSlug from '../../integrations/[slug]/DeleteIntegrationSlug';

interface OpenAEVScenarioSlugProps {
  queryRef: PreloadedQuery<documentQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

const OpenaevScenarioSlug = ({
  queryRef,
  serviceInstance,
}: OpenAEVScenarioSlugProps) => {
  const data = usePreloadedQuery<documentQuery>(DocumentsItemQuery, queryRef);

  const documentData = readInlineData<documentItem_fragment$key>(
    documentItem,
    data.document
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
          serviceInstance={serviceInstance}
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
          }
        />
      </AppServiceContext>
    )
  );
};

// Component export
export default OpenaevScenarioSlug;
