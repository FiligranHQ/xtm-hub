import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import { SERVICES } from '../../../../tests/tests.const';
import { ServiceDefinitionIdentifier } from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ServiceDefinitionDomain } from './service-definition.domain';

describe('ServiceDefinitionDomain', () => {
  describe('loadServiceDefinitionByServiceInstanceSlug', () => {
    it('should return undefined when service definition is not found', async () => {
      const result =
        await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstanceSlug(
          'unknown-slug'
        );

      expect(result).toBeUndefined();
    });

    it('should return service definition when is it linked to the service instance', async () => {
      const result =
        await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstanceSlug(
          SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG
        );

      expect(result).toBeDefined();
      expect(result!.identifier).toBe(
        ServiceDefinitionIdentifier.OpenctiCustomDashboards
      );
    });
  });

  describe('loadServiceDefinitionByServiceInstance', () => {
    it('should return undefined when service definition is not found', async () => {
      const result =
        await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
          uuidv4() as ServiceInstanceId
        );

      expect(result).toBeUndefined();
    });

    it('should return service definition when is it linked to the service instance', async () => {
      const serviceInstance = await db('ServiceInstance')
        .where({ slug: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.SLUG })
        .first();

      expect(serviceInstance).toBeDefined();

      const result =
        await ServiceDefinitionDomain.loadServiceDefinitionByServiceInstance(
          serviceInstance!.id
        );

      expect(result).toBeDefined();
      expect(result!.identifier).toBe(
        ServiceDefinitionIdentifier.OpenctiCustomDashboards
      );
    });
  });
});
