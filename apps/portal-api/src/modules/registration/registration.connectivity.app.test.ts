import { v4 as uuidv4 } from 'uuid';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  requestContextRegistererUserSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  PlatformContract,
  PlatformIdentifier,
  PlatformRegistrationConnectivityStatus,
  ServiceConfigurationStatus,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { BadRequestErrorCode, ErrorCode } from '../../utils/error/error.code';
import { registrationApp } from './registration.app';
import { registrationConnectivityApp } from './registration.connectivity.app';
import { ServiceConfigurationDomain } from './service-configuration/service-configuration.domain';

describe('registration connectivity app', () => {
  beforeEach(() => {
    requestContext.set(requestContextRegistererUserSecondOrga);
  });

  afterAll(async () => {
    vi.useRealTimers();
  });

  describe('refreshPlatformRegistrationConnectivityStatus', () => {
    it('should throw an error when version is not formatted as a semantic version', async () => {
      const call =
        registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '9.Y.Z',
          }
        );

      await expect(call).rejects.toThrow(ErrorCode.InvalidPlatformVersion);
    });

    it('should throw TENANT_ID_MANDATORY when no tenantId is provided but the platform version requires one', async () => {
      const call =
        registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '2.4.0',
            platformIdentifier: PlatformIdentifier.Openaev,
          }
        );

      await expect(call).rejects.toThrow(BadRequestErrorCode.TenantIdMandatory);
    });

    it('should return inactive when platform is not registered but identifier is not provided', async () => {
      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '7.0.0',
          }
        );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });

    it('should return not found when platform is not registered and has version below compatibility version', async () => {
      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '7.0.0',
            platformIdentifier: PlatformIdentifier.Opencti,
          }
        );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.NotFound
      );
    });

    it('should return inactive when platform is not registered and has version above compatibility version', async () => {
      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '6.0.0',
          }
        );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.Inactive
      );
    });

    it('should return active when platform is registered and update version', async () => {
      const platformId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
        },
        identifier: PlatformIdentifier.Opencti,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatus(
          {
            platformId,
            token,
            platformVersion: '6.7.18',
          }
        );

      const getPlatforms = await registrationApp.loadRegisteredPlatforms({
        identifier: PlatformIdentifier.Opencti,
      });
      const currentPlatform = getPlatforms.find(
        (registeredPlatform) => platformId === registeredPlatform.platform_id
      );
      expect(currentPlatform?.version).toBe('6.7.18');
      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
    });
  });

  describe('refreshPlatformRegistrationConnectivityStatusSingleTenant', () => {
    it('should throw an error when version is not formatted as a semantic version', async () => {
      const call =
        registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusSingleTenant(
          {
            platformId: uuidv4(),
            token: uuidv4(),
            platformVersion: '9.Y.Z',
            url: 'http://example.com/tenant',
            tenantId: uuidv4(),
            platformIdentifier: PlatformIdentifier.Openaev,
          }
        );

      await expect(call).rejects.toThrow(ErrorCode.InvalidPlatformVersion);
    });

    it('should return active when platform is registered with tenant_id and correct tenant_id is provided', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenant',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusSingleTenant(
          {
            platformId,
            token,
            platformVersion: '6.7.18',
            url: 'http://example.com/tenant',
            tenantId,
            platformIdentifier: PlatformIdentifier.Openaev,
          }
        );

      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
    });

    it('should update the url in the configuration when url changes', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const newUrl = 'http://example.com/tenantId';
      await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusSingleTenant(
        {
          platformId,
          token,
          platformVersion: '6.7.18',
          url: newUrl,
          tenantId,
          platformIdentifier: PlatformIdentifier.Openaev,
        }
      );

      const config =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { tenantId }
        );
      expect((config?.config as Record<string, unknown>)['url']).toBe(newUrl);
    });

    it('should return not found when platform is registered with tenant_id but wrong tenant_id is provided', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenantId',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusSingleTenant(
          {
            platformId,
            token,
            platformVersion: '6.7.18',
            url: 'http://example.com/tenantId',
            tenantId: uuidv4(),
            platformIdentifier: PlatformIdentifier.Openaev,
          }
        );

      expect(result.status).toBe(
        PlatformRegistrationConnectivityStatus.NotFound
      );
    });

    it('should return active and update config with tenantId when a legacy platform (registered without tenantId on an old version) upgrades to a version that requires it', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();
      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusSingleTenant(
          {
            platformId,
            token,
            platformVersion: '2.4.0',
            url: 'http://example.com/tenantId',
            tenantId,
            platformIdentifier: PlatformIdentifier.Openaev,
          }
        );

      expect(result.status).toBe(PlatformRegistrationConnectivityStatus.Active);
      const updatedConfig =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { tenantId }
        );
      expect(updatedConfig?.config).toMatchObject({ tenant_id: tenantId });
    });
  });

  describe('refreshPlatformRegistrationConnectivityStatusAllTenants', () => {
    it('should return inactive for all tenants when version is not formatted as a semantic version', async () => {
      const tenantId = uuidv4();
      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId: uuidv4(),
            platformVersion: '9.Y.Z',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [
              {
                tenantId,
                token: uuidv4(),
                url: 'http://example.com/tenant1',
              },
            ],
          }
        );

      expect(result.statuses).toHaveLength(1);
      expect(result.statuses[0]).toEqual({
        tenantId,
        status: PlatformRegistrationConnectivityStatus.Inactive,
      });
    });

    it('should return statuses for each tenant', async () => {
      const platformId = uuidv4();
      const tenantId1 = uuidv4();
      const tenantId2 = uuidv4();

      const token1 = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenantId1',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId: tenantId1,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const token2 = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenantId2',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId: tenantId2,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId,
            platformVersion: '6.7.18',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [
              {
                tenantId: tenantId1,
                token: token1,
                url: 'http://example.com/tenant1',
              },
              {
                tenantId: tenantId2,
                token: token2,
                url: 'http://example.com/tenant2',
              },
            ],
          }
        );

      expect(result.statuses).toHaveLength(2);
      expect(result.statuses).toEqual(
        expect.arrayContaining([
          {
            tenantId: tenantId1,
            status: PlatformRegistrationConnectivityStatus.Active,
          },
          {
            tenantId: tenantId2,
            status: PlatformRegistrationConnectivityStatus.Active,
          },
        ])
      );
    });

    it('should return not found for a tenant with wrong token', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();

      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId,
            platformVersion: '6.7.18',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [
              { tenantId, token: uuidv4(), url: 'http://example.com/tenant' },
            ],
          }
        );

      expect(result.statuses).toHaveLength(1);
      expect(result.statuses).toEqual([
        { tenantId, status: PlatformRegistrationConnectivityStatus.NotFound },
      ]);
    });

    it('should return empty statuses when no tenants are provided', async () => {
      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId: uuidv4(),
            platformVersion: '6.7.18',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [],
          }
        );

      expect(result.statuses).toHaveLength(0);
    });

    it('should return inactive for a failed tenant and active for a successful one', async () => {
      const platformId = uuidv4();
      const tenantId = uuidv4();

      const token = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const failingTenantId = uuidv4();

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId,
            platformVersion: '6.7.18',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [
              { tenantId, token, url: 'http://example.com/tenant1' },
              {
                tenantId: failingTenantId,
                token: uuidv4(),
                url: 'http://example.com/tenant2',
              },
            ],
          }
        );

      expect(result.statuses).toHaveLength(2);
      expect(result.statuses).toEqual(
        expect.arrayContaining([
          { tenantId, status: PlatformRegistrationConnectivityStatus.Active },
          {
            tenantId: failingTenantId,
            status: PlatformRegistrationConnectivityStatus.NotFound,
          },
        ])
      );
    });

    it('should deactivate tenants with the same platformId that were not provided in the call', async () => {
      const platformId = uuidv4();
      const tenantId1 = uuidv4();
      const tenantId2 = uuidv4();

      const token1 = await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenantId1',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId: tenantId1,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      await registrationApp.registerPlatform({
        organizationId: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
        platform: {
          id: platformId,
          url: 'http://example.com/tenantId2',
          contract: PlatformContract.Ee,
          title: 'Fake title',
          version: '1.0.0',
          tenantId: tenantId2,
        },
        identifier: PlatformIdentifier.Openaev,
      });

      const result =
        await registrationConnectivityApp.refreshPlatformRegistrationConnectivityStatusAllTenants(
          {
            platformId,
            platformVersion: '6.7.18',
            platformIdentifier: PlatformIdentifier.Openaev,
            tenants: [
              {
                tenantId: tenantId1,
                token: token1,
                url: 'http://example.com/tenantId1',
              },
            ],
          }
        );

      expect(result.statuses).toHaveLength(1);
      expect(result.statuses[0]).toEqual({
        tenantId: tenantId1,
        status: PlatformRegistrationConnectivityStatus.Active,
      });

      const staleConfig =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(
          platformId,
          { tenantId: tenantId2 }
        );
      expect(staleConfig?.status).toBe(ServiceConfigurationStatus.Inactive);
    });
  });
});
