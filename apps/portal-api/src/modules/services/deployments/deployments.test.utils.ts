import { v4 as uuidv4 } from 'uuid';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  DeploymentRequestActivitySector,
  DeploymentRequestDeploymentType,
  DeploymentRequestHubStatus,
  DeploymentRequestJobTitle,
  DeploymentRequestPlatformRegion,
  DeploymentRequestPlatformState,
  DeploymentRequestSource,
  DeploymentRequestUseCase,
  PlatformIdentifier,
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
} from '../../../model/kanel/public/DeploymentRequest';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { insertSubscription } from '../../subcription/subscription.helper';
import { serviceInstanceTagMappedByPlatformIdentifier } from '../registration/registration.mapping';
import { insertServiceInstance } from '../service-instance.domain';
import { DeploymentRequestDomain } from './deployments.domain';

export async function insertDeploymentRequest(
  deploymentRequest: Partial<DeploymentRequestInitializer>
): Promise<DeploymentRequest> {
  const serviceInstanceId = uuidv4() as ServiceInstanceId;
  await insertServiceInstance({
    id: serviceInstanceId,
    name: 'oneRandomTrialInstance',
    description: '',
    creation_status: ServiceInstanceCreationStatus.Pending,
    public: false,
    join_type: ServiceInstanceJoinType.JoinAuto,
    tags: [
      serviceInstanceTagMappedByPlatformIdentifier[PlatformIdentifier.Opencti],
    ],
    service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
  });
  await insertSubscription({
    id: uuidv4(),
    organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
    service_instance_id: serviceInstanceId,
  });
  const defaultDeploymentRequestValues = {
    activity_sector: DeploymentRequestActivitySector.ComputerNetworkSecurity,
    id: uuidv4() as DeploymentRequestId,
    job_title: DeploymentRequestJobTitle.CybersecurityEngineer,
    organization_requester_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
    platform_identifier: PlatformIdentifier.Opencti,
    platform_token: uuidv4(),
    region: DeploymentRequestPlatformRegion.UsEast,
    request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
    hub_status: DeploymentRequestHubStatus.Pending,
    target_state: DeploymentRequestPlatformState.Active,
    actual_state: undefined,
    ordering: 1,
    type: DeploymentRequestDeploymentType.Trial,
    use_case: DeploymentRequestUseCase.ThreatHunting,
    service_instance_id: serviceInstanceId as ServiceInstanceId,
    user_requester_id: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
    source: DeploymentRequestSource.Xtmhub,
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
