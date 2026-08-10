import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
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
} from '../../src/__generated__/resolvers-types';
import DeploymentRequest, {
  DeploymentRequestId,
  DeploymentRequestInitializer,
  DeploymentRequestMutator,
} from '../../src/model/kanel/public/DeploymentRequest';
import DeploymentRequestQuota, {
  DeploymentRequestQuotaMutator,
} from '../../src/model/kanel/public/DeploymentRequestQuota';
import { ServiceInstanceId } from '../../src/model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../src/model/kanel/public/Subscription';
import { DeploymentRequestDomain } from '../../src/modules/deployment/deployment.domain';
import { serviceInstanceTagMappedByPlatformIdentifier } from '../../src/modules/registration/registration.mapping';
import { ServiceInstanceDomain } from '../../src/modules/service/instance/service-instance.domain';
import { SERVICES, TEST_ORGANIZATIONS } from '../tests.const';

export const TestDeploymentHelper = {
  deploymentRequest: {
    delete: async (field: DeploymentRequestMutator) => {
      await db<DeploymentRequest>('DeploymentRequest').where(field).del();
    },
    update: async (field: DeploymentRequestMutator) => {
      await db<DeploymentRequest>('DeploymentRequest').update(field);
    },
    loadMany: async (
      field: DeploymentRequestMutator
    ): Promise<DeploymentRequest[]> => {
      return db<DeploymentRequest[]>('DeploymentRequest')
        .where(field)
        .select('*');
    },
    create: async (
      data?: DeploymentRequestMutator
    ): Promise<DeploymentRequest | undefined> => {
      const [deploymentRequest] = await db<DeploymentRequest>(
        'DeploymentRequest'
      )
        .insert({
          id: uuidv4() as DeploymentRequestId,
          platform_id: uuidv4(),
          type: DeploymentRequestDeploymentType.Trial,
          platform_identifier: PlatformIdentifier.Opencti,
          region: DeploymentRequestPlatformRegion.EuWest,
          platform_token: uuidv4(),
          ...data,
        })
        .returning('*');
      return deploymentRequest;
    },
    createWithServiceInstanceAndSubscription: async (
      deploymentRequest: Partial<DeploymentRequestInitializer>
    ): Promise<DeploymentRequest> => {
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      await ServiceInstanceDomain.insertServiceInstance({
        id: serviceInstanceId,
        name: 'oneRandomTrialInstance',
        description: '',
        creation_status: ServiceInstanceCreationStatus.Pending,
        public: false,
        tags: [
          serviceInstanceTagMappedByPlatformIdentifier[
            PlatformIdentifier.Opencti
          ],
        ],
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });

      await db<Subscription>('Subscription').insert({
        id: uuidv4() as SubscriptionId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        service_instance_id: serviceInstanceId,
      });

      const defaultDeploymentRequestValues: DeploymentRequestInitializer = {
        activity_sector:
          DeploymentRequestActivitySector.ComputerNetworkSecurity,
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
    },
    assertProperties: async (
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

      if (ordering !== undefined) {
        expect(deploymentRequest!.ordering).toBe(ordering);
      }
    },
  },
  deploymentRequestQuota: {
    load: async (
      field: DeploymentRequestQuotaMutator
    ): Promise<DeploymentRequestQuota | undefined> => {
      return db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .where(field)
        .select('*')
        .first();
    },
    update: async (
      fieldWhere: DeploymentRequestQuotaMutator,
      fieldUpdate: DeploymentRequestQuotaMutator
    ): Promise<void> => {
      await db<DeploymentRequestQuota>('DeploymentRequestQuota')
        .update(fieldUpdate)
        .where(fieldWhere);
    },
  },
};
