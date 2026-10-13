import DataLoader from 'dataloader';
import { DeploymentRequestId } from '../../model/kanel/public/DeploymentRequest';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import {
  DeploymentRequestDomain,
  FullyQualifiedDeploymentRequest,
} from './deployment.domain';

export interface DeploymentRequestDataLoaders {
  childrenByParentLoader: DataLoader<
    DeploymentRequestId,
    FullyQualifiedDeploymentRequest[]
  >;
  deploymentRequestByServiceInstanceLoader: DataLoader<
    ServiceInstanceId,
    FullyQualifiedDeploymentRequest | null
  >;
}

export const DeploymentRequestDataLoader = {
  batchLoadChildren: async (
    parentIds: readonly DeploymentRequestId[]
  ): Promise<FullyQualifiedDeploymentRequest[][]> => {
    const rows =
      await DeploymentRequestDomain.loadChildrenByParentIds(parentIds);

    const map = new Map<string, FullyQualifiedDeploymentRequest[]>();
    for (const row of rows) {
      if (row.parent_id === null) {
        continue;
      }
      const existing = map.get(row.parent_id) ?? [];
      existing.push(row);
      map.set(row.parent_id, existing);
    }
    return parentIds.map((parentId) => map.get(parentId) ?? []);
  },

  batchLoadByServiceInstanceIds: async (
    serviceInstanceIds: readonly ServiceInstanceId[]
  ): Promise<(FullyQualifiedDeploymentRequest | null)[]> => {
    const rows =
      await DeploymentRequestDomain.loadFullDeploymentRequestsByServiceInstanceIds(
        serviceInstanceIds
      );

    const map = new Map<ServiceInstanceId, FullyQualifiedDeploymentRequest>(
      rows.map((row) => [row.service_instance_id, row])
    );
    return serviceInstanceIds.map((id) => map.get(id) ?? null);
  },

  create: (): DeploymentRequestDataLoaders => ({
    childrenByParentLoader: new DataLoader(
      DeploymentRequestDataLoader.batchLoadChildren
    ),
    deploymentRequestByServiceInstanceLoader: new DataLoader(
      DeploymentRequestDataLoader.batchLoadByServiceInstanceIds
    ),
  }),
};
