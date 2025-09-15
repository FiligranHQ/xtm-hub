import ServiceInstanceCard from '@/components/service/service-instance-card';
import { FeatureFlag } from '@/utils/constant';
import { isFeatureEnabled } from '@/utils/settings.service';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';

export const ServiceInstanceConnectorCard = async () => {
  const isConnectorsPageEnabled = await isFeatureEnabled(
    FeatureFlag.CONNECTORS_PAGE
  );
  return (
    <>
      {isConnectorsPageEnabled && (
        <ServiceInstanceCard
          key={'Connector'}
          serviceInstance={{
            id: 'Connector',
            creation_status: ServiceInstanceCreationStatusEnum.CREATED,
            name: 'OpenCTI Connectors',
            slug: 'opencti-connectors',
            description:
              'Explore a range of OpenCTI Connectors shared by the Filigran team',
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
