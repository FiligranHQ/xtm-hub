import { db } from './db-connection';
import {
  addServiceInstance,
  loadServiceDefinitionIdByIdentifier,
} from './service.helper';
import { v4 as uuidv4 } from 'uuid';
import { addSubscription } from './subscription.helper';

export const insertDeploymentRequest = async (
  deploymentRequestData: Record<string, unknown>
) => {
  const [serviceDefinition] = await loadServiceDefinitionIdByIdentifier(
    'opencti_registration'
  );

  const serviceInstanceId = await addServiceInstance(serviceDefinition.id);

  await addSubscription({
    id: uuidv4(),
    organization_id: deploymentRequestData.organization_requester_id,
    service_instance_id: serviceInstanceId,
    start_date: new Date(),
    end_date: null,
  });

  await db('DeploymentRequest')
    .insert({
      service_instance_id: serviceInstanceId,
      ...deploymentRequestData,
    })
    .onConflict('id')
    .ignore();
};
