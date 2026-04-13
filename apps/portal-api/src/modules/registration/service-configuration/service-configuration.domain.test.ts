import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/test.helper';
import {
  contextSimpleUserSecondOrga,
  SERVICES,
} from '../../../../tests/tests.const';
import {
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import { ServiceDefinitionDomain } from '../../service/definition/service-definition.domain';
import { ServiceConfigurationDomain } from './service-configuration.domain';

describe('ServiceConfigurationDomain', () => {
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
          platformId,
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
            platformId: platformId(),
            token: token(),
          });

        expect(configuration).toBeUndefined();
      }
    );
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
          ServiceConfigurationStatus.Active
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
          ServiceConfigurationStatus.Inactive
        );

      expect(configuration).toBeUndefined();
    });

    it('should return undefined when platform is not found', async () => {
      const configuration =
        await ServiceConfigurationDomain.loadConfigurationByPlatform(uuidv4());

      expect(configuration).toBeUndefined();
    });
  });
});
