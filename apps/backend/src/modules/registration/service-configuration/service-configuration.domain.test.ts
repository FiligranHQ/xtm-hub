import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  contextSimpleUserSecondOrga,
  SERVICES,
} from '../../../../tests/tests.const';
import {
  PlatformIdentifier,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { ErrorCode } from '../../../utils/error/error.code';
import { ServiceDefinitionDomain } from '../../service/definition/service-definition.domain';
import { ServiceConfigurationDomain } from './service-configuration.domain';

describe('serviceConfigurationDomain', () => {
  describe('isServiceConfigurationValid', () => {
    const context = contextSimpleUserSecondOrga;
    it('should throw an error when service contract is not found', async () => {
      const call = ServiceConfigurationDomain.isServiceConfigurationValid(
        uuidv4() as ServiceDefinitionId,
        {}
      );

      await expect(call).rejects.toThrow('SERVICE_CONTRACT_NOT_FOUND');
    });

    it('should return true when configuration match the schema specifications', async () => {
      const serviceDefinition =
        await ServiceDefinitionDomain.loadServiceDefinitionBy({
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        });

      const configuration = {
        registerer_id: context.user.id,
        platform_id: uuidv4(),
        platform_url: 'http://example.com/',
        platform_title: 'Platform title',
        token: uuidv4(),
        platform_contract: 'EE',
        last_connection_check: new Date().toISOString(),
      };

      const result =
        await ServiceConfigurationDomain.isServiceConfigurationValid(
          serviceDefinition!.id,
          configuration
        );

      expect(result).toBeTruthy();
    });

    it('should return false when configuration does not match the schema specifications', async () => {
      const serviceDefinition =
        await ServiceDefinitionDomain.loadServiceDefinitionBy({
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        });

      const result =
        await ServiceConfigurationDomain.isServiceConfigurationValid(
          serviceDefinition!.id,
          {}
        );

      expect(result).toBeFalsy();
    });
  });

  describe('loadConfigurationByPlatformAndToken', () => {
    let platformId: string;
    let token: string;

    beforeEach(async () => {
      token = uuidv4();
      platformId = uuidv4();

      await TestHelper.serviceConfiguration.delete({});
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: {
          token,
          platform_id: platformId,
        },
      });
    });

    it('should return configuration when platform and token is found in its config', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
          platform_id: platformId,
          token,
        });

      expect(configuration).toMatchObject({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: {
          token,
          platform_id: platformId,
        },
      });
    });

    it.each([
      { platformId: () => platformId, token: () => uuidv4() },
      { platformId: () => uuidv4(), token: () => token },
      { platformId: () => uuidv4(), token: () => uuidv4() },
    ])(
      'should return undefined when platformId is $platformId and token is $token',
      async ({ platformId, token }) => {
        const configuration =
          await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
            platform_id: platformId(),
            token: token(),
          });

        expect(configuration).toBeUndefined();
      }
    );

    describe('withoutTenantId option', () => {
      it('should return configuration when withoutTenantId is true and config has no tenant_id', async () => {
        const configuration =
          await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken({
            platform_id: platformId,
            token,
            withoutTenantId: true,
          });

        expect(configuration).toMatchObject({
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          config: { platform_id: platformId, token },
        });
      });

      describe('when config has a tenant_id', () => {
        let tenantId: string;

        beforeEach(async () => {
          tenantId = uuidv4();
          await TestHelper.serviceConfiguration.delete({});
          await TestHelper.serviceConfiguration.create({
            service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
            status: ServiceConfigurationStatus.Active,
            config: { token, platform_id: platformId, tenant_id: tenantId },
          });
        });

        afterEach(async () => {
          await TestHelper.serviceConfiguration.delete({});
        });

        it('should return undefined when withoutTenantId is true', async () => {
          const configuration =
            await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken(
              {
                platform_id: platformId,
                token,
                withoutTenantId: true,
              }
            );

          expect(configuration).toBeUndefined();
        });

        it('should return configuration when withoutTenantId is false', async () => {
          const configuration =
            await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken(
              {
                platform_id: platformId,
                token,
                withoutTenantId: false,
              }
            );

          expect(configuration).toMatchObject({
            service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
            config: { platform_id: platformId, token, tenant_id: tenantId },
          });
        });

        it('should return configuration when withoutTenantId is not provided', async () => {
          const configuration =
            await ServiceConfigurationDomain.loadConfigurationByPlatformAndToken(
              {
                platform_id: platformId,
                token,
              }
            );

          expect(configuration).toMatchObject({
            service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
            config: { platform_id: platformId, token, tenant_id: tenantId },
          });
        });
      });
    });
  });

  describe('loadConfigurationByPlatform', () => {
    let token: string;
    let platformId: string;

    beforeEach(async () => {
      token = uuidv4();
      platformId = uuidv4();

      await TestHelper.serviceConfiguration.delete({});
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: {
          token,
          platform_id: platformId,
        },
      });
    });

    it('should return configuration when platform is found in its config', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId
        );

      expect(configuration).toMatchObject({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: {
          token,
          platform_id: platformId,
        },
      });
    });

    it('should return configuration when platform is found and active, and filter is active', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { status: ServiceConfigurationStatus.Active }
        );

      expect(configuration).toMatchObject({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: {
          token,
          platform_id: platformId,
        },
      });
    });

    it('should return undefined when configuration is active and inactive filter is used', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { status: ServiceConfigurationStatus.Inactive }
        );

      expect(configuration).toBeUndefined();
    });

    it('should return undefined when platform is not found', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(uuidv4());

      expect(configuration).toBeUndefined();
    });
  });

  describe('loadConfigurationByPlatform with tenantId disambiguation', () => {
    let platformId: string;
    const tenantId1 = 'tenant-alpha';
    const tenantId2 = 'tenant-beta';

    beforeEach(async () => {
      platformId = uuidv4();

      await TestHelper.serviceConfiguration.delete({});
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId1 },
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId2 },
      });
    });

    it.each`
      tenantId     | description
      ${tenantId1} | ${'first tenant'}
      ${tenantId2} | ${'second tenant'}
    `(
      'should return the configuration matching $description when tenantId is provided',
      async ({ tenantId }: { tenantId: string }) => {
        const configuration =
          await ServiceConfigurationDomain.loadConfigurationByPlatform(
            platformId,
            { tenantId }
          );

        expect(configuration).toMatchObject({
          config: { platform_id: platformId, tenant_id: tenantId },
        });
      }
    );

    it('should return undefined when tenantId does not match any configuration', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { tenantId: 'unknown-tenant' }
        );

      expect(configuration).toBeUndefined();
    });
  });

  describe('loadActiveConfigurationsByPlatformExcludingTenants', () => {
    let platformId: string;
    const tenantId1 = 'tenant-alpha';
    const tenantId2 = 'tenant-beta';
    const tenantId3 = 'tenant-gamma';

    beforeEach(async () => {
      platformId = uuidv4();

      await TestHelper.serviceConfiguration.delete({});
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId1 },
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId2 },
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId3 },
      });
    });

    it('should return all tenants when excluded list is empty', async () => {
      const configurations =
        await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          platformId,
          []
        );

      expect(configurations).toHaveLength(3);
    });

    it('should exclude the provided tenantIds and return the others', async () => {
      const configurations =
        await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          platformId,
          [tenantId1, tenantId2]
        );

      expect(configurations).toHaveLength(1);
      expect(configurations[0]?.config).toMatchObject({
        tenant_id: tenantId3,
      });
    });

    it('should return empty when all tenantIds are excluded', async () => {
      const configurations =
        await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          platformId,
          [tenantId1, tenantId2, tenantId3]
        );

      expect(configurations).toHaveLength(0);
    });

    it('should not return inactive configurations', async () => {
      await TestHelper.serviceConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.EPIC.ID,
        status: ServiceConfigurationStatus.Inactive,
        config: { platform_id: platformId, tenant_id: 'tenant-inactive' },
      });

      const configurations =
        await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          platformId,
          []
        );

      expect(configurations).toHaveLength(3);
      expect(
        configurations.every(
          (c) => c.status === ServiceConfigurationStatus.Active
        )
      ).toBe(true);
    });

    it('should not return configurations from a different platformId', async () => {
      const configurations =
        await ServiceConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          uuidv4(),
          []
        );

      expect(configurations).toHaveLength(0);
    });
  });

  describe('loadResolvedConfigurationByPlatform', () => {
    let platformId: string;
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      platformId = uuidv4();
      serviceInstanceId = uuidv4() as ServiceInstanceId;
    });

    afterEach(async () => {
      await TestHelper.serviceConfiguration.delete({
        service_instance_id: serviceInstanceId,
      });
      await TestHelper.serviceInstance.delete({ id: serviceInstanceId });
    });

    it('should return undefined when no configuration matches the platformId', async () => {
      const resolved =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          uuidv4()
        );

      expect(resolved).toBeUndefined();
    });

    it('should return resolved configuration with joined definition and mapped identifier', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, token: 'abc' },
      });

      const resolved =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId
        );

      expect(resolved).toBeDefined();
      expect(resolved?.serviceConfiguration).toMatchObject({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
      });
      expect(resolved?.serviceDefinition?.id).toBe(
        SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID
      );
      expect(resolved?.serviceDefinition?.identifier).toBe(
        ServiceDefinitionIdentifier.OpenctiRegistration
      );
      expect(resolved?.platformIdentifier).toBe(PlatformIdentifier.Opencti);
      expect(resolved?.config).toMatchObject({
        platform_id: platformId,
        token: 'abc',
      });
    });

    it('should throw ServiceDefinitionNotFound when the instance has no service_definition_id', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: null,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId },
      });

      const call =
        ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId
        );

      await expect(call).rejects.toThrow(ErrorCode.ServiceDefinitionNotFound);
    });

    it('should filter by status when status option is provided', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Inactive,
        config: { platform_id: platformId },
      });

      const resolvedInactive =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { status: ServiceConfigurationStatus.Inactive }
        );
      const resolvedActive =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { status: ServiceConfigurationStatus.Active }
        );

      expect(resolvedInactive).toBeDefined();
      expect(resolvedActive).toBeUndefined();
    });

    it('should filter by tenantId when tenantId option is provided', async () => {
      const tenantId = uuidv4();
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, tenant_id: tenantId },
      });

      const resolvedWithTenant =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { tenantId }
        );
      const resolvedWithOtherTenant =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { tenantId: uuidv4() }
        );

      expect(resolvedWithTenant?.config.tenant_id).toBe(tenantId);
      expect(resolvedWithOtherTenant).toBeUndefined();
    });
  });

  describe('loadResolvedConfigurationByPlatformAndToken', () => {
    let platformId: string;
    let token: string;
    let serviceInstanceId: ServiceInstanceId;

    beforeEach(async () => {
      platformId = uuidv4();
      token = uuidv4();
      serviceInstanceId = uuidv4() as ServiceInstanceId;
    });

    afterEach(async () => {
      await TestHelper.serviceConfiguration.delete({
        service_instance_id: serviceInstanceId,
      });
      await TestHelper.serviceInstance.delete({ id: serviceInstanceId });
    });

    it('should return resolved configuration when platformId and token match', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENAEV_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, token },
      });

      const resolved =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token }
        );

      expect(resolved).toBeDefined();
      expect(resolved?.serviceConfiguration.service_instance_id).toBe(
        serviceInstanceId
      );
      expect(resolved?.serviceDefinition?.identifier).toBe(
        ServiceDefinitionIdentifier.OpenaevRegistration
      );
      expect(resolved?.platformIdentifier).toBe(PlatformIdentifier.Openaev);
    });

    it('should return undefined when token does not match', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, token },
      });

      const resolved =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token: uuidv4() }
        );

      expect(resolved).toBeUndefined();
    });

    it('should return undefined when withoutTenantId is true and config has a tenant_id', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, token, tenant_id: uuidv4() },
      });

      const resolved =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token, withoutTenantId: true }
        );

      expect(resolved).toBeUndefined();
    });

    it('should filter by tenant_id when provided', async () => {
      const tenantId = uuidv4();
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.serviceConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: ServiceConfigurationStatus.Active,
        config: { platform_id: platformId, token, tenant_id: tenantId },
      });

      const resolvedMatching =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token, tenant_id: tenantId }
        );
      const resolvedMismatch =
        await ServiceConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token, tenant_id: uuidv4() }
        );

      expect(resolvedMatching?.config.tenant_id).toBe(tenantId);
      expect(resolvedMismatch).toBeUndefined();
    });
  });
});
