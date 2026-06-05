import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  contextSimpleUserSecondOrga,
  SERVICES,
} from '../../../../tests/tests.const';
import {
  PlatformConfigurationStatus,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PlatformConfigurationDomain } from './platform-configuration.domain';

describe('platformConfigurationDomain', () => {
  describe('isPlatformConfigurationValid', () => {
    it('returns true for valid platform configuration', async () => {
      const result =
        await PlatformConfigurationDomain.isPlatformConfigurationValid({
          registerer_id: contextSimpleUserSecondOrga.user.id,
          platform_id: uuidv4(),
          platform_url: 'http://example.com/',
          platform_title: 'Platform title',
          token: uuidv4(),
          platform_contract: 'EE',
          platform_version: '1.0.0',
          last_connectivity_check: new Date(),
        });

      expect(result).toBe(true);
    });

    it('returns false for invalid platform configuration', async () => {
      const result =
        await PlatformConfigurationDomain.isPlatformConfigurationValid({});

      expect(result).toBe(false);
    });
  });

  describe('loadConfigurationByPlatformAndToken', () => {
    const platformId = uuidv4();
    const token = uuidv4();

    beforeEach(async () => {
      await TestHelper.platformConfiguration.delete({});
      await TestHelper.platformConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
      });
    });

    it('loads by platform and token', async () => {
      const configuration =
        await PlatformConfigurationDomain.loadConfigurationByPlatformAndToken({
          platform_id: platformId,
          token,
        });

      expect(configuration).toMatchObject({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        platform_id: platformId,
        token,
      });
    });
  });

  describe('loadConfigurationByPlatform', () => {
    const platformId = uuidv4();

    beforeEach(async () => {
      await TestHelper.platformConfiguration.delete({});
      await TestHelper.platformConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token: uuidv4(),
      });
    });

    it('loads by platform id', async () => {
      const configuration =
        await PlatformConfigurationDomain.loadConfigurationByPlatform(
          platformId
        );
      expect(configuration?.platform_id).toBe(platformId);
    });
  });

  describe('loadActiveConfigurationsByPlatformExcludingTenants', () => {
    const platformId = uuidv4();
    const tenantAId = uuidv4();
    const tenantBId = uuidv4();

    beforeEach(async () => {
      await TestHelper.platformConfiguration.delete({});
      await TestHelper.platformConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        tenant_id: tenantAId,
      });
      await TestHelper.platformConfiguration.create({
        service_instance_id: SERVICES.INSTANCES.OPENAEV_SCENARIOS.ID,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        tenant_id: tenantBId,
      });
    });

    it('excludes requested tenants', async () => {
      const configurations =
        await PlatformConfigurationDomain.loadActiveConfigurationsByPlatformExcludingTenants(
          platformId,
          [tenantAId]
        );

      expect(configurations).toHaveLength(1);
      expect(configurations[0]?.tenant_id).toBe(tenantBId);
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
      await TestHelper.platformConfiguration.delete({
        service_instance_id: serviceInstanceId,
      });
      await TestHelper.serviceInstance.delete({ id: serviceInstanceId });
    });

    it('should return undefined when no configuration matches the platformId', async () => {
      const resolved =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          uuidv4()
        );

      expect(resolved).toBeUndefined();
    });

    it('should return resolved configuration with joined definition and mapped identifier', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      const { token } = await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token: uuidv4(),
      });

      const resolved =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId
        );

      expect(resolved).toBeDefined();
      expect(resolved?.platformConfiguration).toMatchObject({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
      });
      expect(resolved?.serviceDefinition?.id).toBe(
        SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID
      );
      expect(resolved?.serviceDefinition?.identifier).toBe(
        ServiceDefinitionIdentifier.OpenctiRegistration
      );
      expect(resolved?.platformIdentifier).toBe(PlatformIdentifier.Opencti);
    });

    it('should filter by status when status option is provided', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Inactive,
        platform_id: platformId,
      });

      const resolvedInactive =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { status: PlatformConfigurationStatus.Inactive }
        );
      const resolvedActive =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { status: PlatformConfigurationStatus.Active }
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
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        tenant_id: tenantId,
      });

      const resolvedWithTenant =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { tenantId }
        );
      const resolvedWithOtherTenant =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatform(
          platformId,
          { tenantId: uuidv4() }
        );

      expect(resolvedWithTenant?.platformConfiguration.tenant_id).toBe(
        tenantId
      );
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
      await TestHelper.platformConfiguration.delete({
        service_instance_id: serviceInstanceId,
      });
      await TestHelper.serviceInstance.delete({ id: serviceInstanceId });
    });

    it('should return resolved configuration when platformId and token match', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENAEV_REGISTRATION.ID,
      });
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
      });

      const resolved =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token }
        );

      expect(resolved).toBeDefined();
      expect(resolved?.platformConfiguration.service_instance_id).toBe(
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
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
      });

      const resolved =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token: uuidv4() }
        );

      expect(resolved).toBeUndefined();
    });

    it('should return undefined when withoutTenantId is true and config has a tenant_id', async () => {
      await TestHelper.serviceInstance.create({
        id: serviceInstanceId,
        service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
      });
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
        tenant_id: uuidv4(),
      });

      const resolved =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
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
      await TestHelper.platformConfiguration.create({
        service_instance_id: serviceInstanceId,
        status: PlatformConfigurationStatus.Active,
        platform_id: platformId,
        token,
        tenant_id: tenantId,
      });

      const resolvedMatching =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token, tenant_id: tenantId }
        );
      const resolvedMismatch =
        await PlatformConfigurationDomain.loadResolvedConfigurationByPlatformAndToken(
          { platform_id: platformId, token, tenant_id: uuidv4() }
        );

      expect(resolvedMatching?.platformConfiguration.tenant_id).toBe(tenantId);
      expect(resolvedMismatch).toBeUndefined();
    });
  });
});
