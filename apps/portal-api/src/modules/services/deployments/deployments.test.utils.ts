import { v4 as uuidv4 } from 'uuid';
import { SERVICE_OPENCTI_REGISTRATION } from '../../../../tests/tests.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  PlatformIdentifier,
  ServiceInstanceCreationStatus,
} from '../../../__generated__/resolvers-types';
import {
  DeploymentRequestId,
  DeploymentRequestInitializer,
} from '../../../model/kanel/public/DeploymentRequest';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID, PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { insertSubscription } from '../../subcription/subscription.helper';
import { serviceInstanceTagMappedByPlatformIdentifier } from '../registration/registration.mapping';
import { insertServiceInstance } from '../service-instance.domain';
import { DeploymentRequestDomain } from './deployments.domain';

export async function insertOpenCtiDeploymentRequest(
  deploymentRequest: Partial<DeploymentRequestInitializer>
) {
  const serviceInstanceId = uuidv4() as ServiceInstanceId;
  await insertServiceInstance({
    id: serviceInstanceId,
    name: 'serviceInstance1',
    description: '',
    creation_status: ServiceInstanceCreationStatus.Pending,
    public: false,
    join_type: 'JOIN_AUTO',
    tags: [
      serviceInstanceTagMappedByPlatformIdentifier[PlatformIdentifier.Opencti],
    ],
    service_definition_id: SERVICE_OPENCTI_REGISTRATION,
  });
  await insertSubscription({
    id: uuidv4(),
    organization_id: PLATFORM_ORGANIZATION_UUID,
    service_instance_id: serviceInstanceId,
  });
  const defaultDeploymentRequestValues = {
    activity_sector: 'cybersecurity',
    id: uuidv4() as DeploymentRequestId,
    job_title: 'myJob',
    organization_requester_id: PLATFORM_ORGANIZATION_UUID,
    platform_identifier: PlatformIdentifier.Opencti,
    platform_token: uuidv4(),
    region: DeploymentRequestPlatformRegion.UsEast,
    request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
    hub_status: DeploymentRequestHubStatus.Pending,
    target_state: DeploymentRequestPlatformState.Active,
    actual_state: undefined,
    ordering: 1,
    type: DeploymentRequestDeploymentType.Trial,
    use_case: 'use_case',
    service_instance_id: serviceInstanceId as ServiceInstanceId,
    user_requester_id: ADMIN_UUID,
  };
  return await DeploymentRequestDomain.insertDeploymentRequest({
    ...defaultDeploymentRequestValues,
    ...deploymentRequest,
  });
}

export const assertDeploymentRequestProperties = async (
  id: DeploymentRequestId,
  {
    hub_status,
    target_state,
    ordering,
  }: {
    hub_status?: DeploymentRequestHubStatus;
    target_state?: DeploymentRequestPlatformState;
    ordering?: number;
  }
) => {
  const deploymentRequest =
    await DeploymentRequestDomain.loadDeploymentRequestBy({
      id,
    });

  expect(deploymentRequest).toBeDefined();

  if (hub_status) {
    expect(deploymentRequest!.hub_status).toBe(hub_status);
  }

  if (target_state) {
    expect(deploymentRequest!.target_state).toBe(target_state);
  }

  if (ordering) {
    expect(deploymentRequest!.ordering).toBe(ordering);
  }
};
