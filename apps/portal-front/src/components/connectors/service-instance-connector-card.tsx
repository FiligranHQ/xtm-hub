import ServiceInstanceCard from '@/components/service/service-instance-card';
import { FeatureFlag } from '@/utils/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { getTranslations } from 'next-intl/server';

export const ServiceInstanceConnectorCard = async () => {
  const isConnectorsPageEnabled = await isFeatureEnabled(
    FeatureFlag.CONNECTORS_PAGE
  );
  const t = await getTranslations();
  return (
    <>
      {isConnectorsPageEnabled && (
        <ServiceInstanceCard
          key={'Connector'}
          serviceInstance={{
            id: 'Connector',
            creation_status: ServiceInstanceCreationStatusEnum.CREATED,
            name: t('Service.Connectors.Name'),
            slug: 'opencti-connectors',
            description: t('Service.Connectors.Description'),
            illustration_document_id: '' as string,
            logo_document_id: '' as string,
            service_definition_identifier:
              ServiceDefinitionIdentifierEnum.CSV_FEEDS,
            ordering: 0,
          }}
          seo={true}
        />
      )}
    </>
  );
};
