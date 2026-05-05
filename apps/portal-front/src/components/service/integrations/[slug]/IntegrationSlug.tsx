import { AppServiceContext } from '@/components/service/components/ServiceContext';
import { ServiceManageSheet } from '@/components/service/components/ServiceManageSheet';
import ShareableResourceConnectorSlug from '@/components/service/document/connector/ShareableResourceConnectorSlug';
import ShareableResourceSlug from '@/components/service/document/ShareableResourceSlug';
import DeleteIntegrationSlug from '@/components/service/integrations/[slug]/DeleteIntegrationSlug';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import {
  isConnectorResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';

import {
  documentItem,
  DocumentsItemQuery,
} from '@/components/service/document/document.graphql';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { documentQuery } from '@generated/documentQuery.graphql';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useContext, useEffect } from 'react';
import { PreloadedQuery, readInlineData, usePreloadedQuery } from 'react-relay';

// Component interface
interface IntegrationSlugProps {
  queryRef: PreloadedQuery<documentQuery>;
  serviceInstance: serviceInstance_fragment$data;
}

// Component
const IntegrationSlug = ({
  queryRef,
  serviceInstance,
}: IntegrationSlugProps) => {
  const data = usePreloadedQuery<documentQuery>(DocumentsItemQuery, queryRef);
  const { settings } = useContext(SettingsContext);

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
      href: `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`,
      original: true,
    },
    {
      label: documentData!.name!,
      original: true,
    },
  ];

  const { setIntegrationType, ...context } = useDocumentContext({
    serviceInstance,
    type: ShareableResourceType.OPENCTI_INTEGRATION,
  });

  useEffect(() => {
    setIntegrationType(
      (documentData?.integration_type as IntegrationTypeEnum) ??
        IntegrationTypeEnum.CSV_FEED
    );
  }, [setIntegrationType, documentData?.integration_type]);

  const shareUrl = `${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${documentData?.service_instance?.slug}/${documentData?.slug}`;

  return (
    documentData && (
      <AppServiceContext
        {...context}
        setIntegrationType={setIntegrationType}>
        {isConnectorResource(documentData) ? (
          <ShareableResourceConnectorSlug
            breadcrumbValue={breadcrumbValue}
            serviceInstance={serviceInstance}
            documentData={documentData}
            shareUrl={shareUrl}
          />
        ) : (
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
        )}
      </AppServiceContext>
    )
  );
};

// Component export
export default IntegrationSlug;
