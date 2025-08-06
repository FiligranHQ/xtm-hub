import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextAdminUser } from '../../../../tests/tests.const';
import { ServiceDefinitionIdentifier } from '../../../__generated__/resolvers-types';
import { serviceDefinitionDomain } from '../definition/domain';
import { serviceContractDomain } from './domain';

describe('Service Contract Domain', () => {
  describe('isServiceConfigurationValid', () => {
    const context = contextAdminUser;
    it('should throw an error when service contract is not found', async () => {
      const call = serviceContractDomain.isServiceConfigurationValid(
        context,
        uuidv4(),
        {}
      );

      await expect(call).rejects.toThrow('SERVICE_CONTRACT_NOT_FOUND');
    });

    it('should return true when configuration match the schema specifications', async () => {
      const serviceDefinition =
        await serviceDefinitionDomain.loadServiceDefinitionBy(context, {
          identifier: ServiceDefinitionIdentifier.OctiRegistration,
        });

      expect(serviceDefinition).toBeDefined();

      const configuration = {
        enroller_id: context.user.id,
        platform_id: uuidv4(),
        platform_url: 'http://example.com/',
        platform_title: 'Platform title',
        token: uuidv4(),
        platform_contract: 'EE',
      };

      const result = await serviceContractDomain.isServiceConfigurationValid(
        context,
        serviceDefinition.id,
        configuration
      );

      expect(result).toBeTruthy();
    });

    it('should return false when configuration does not match the schema specifications', async () => {
      const serviceDefinition =
        await serviceDefinitionDomain.loadServiceDefinitionBy(context, {
          identifier: ServiceDefinitionIdentifier.OctiRegistration,
        });

      expect(serviceDefinition).toBeDefined();

      const result = await serviceContractDomain.isServiceConfigurationValid(
        context,
        serviceDefinition.id,
        {}
      );

      expect(result).toBeFalsy();
    });
  });
});
