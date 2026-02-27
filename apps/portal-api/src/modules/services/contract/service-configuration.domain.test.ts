import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { contextBypassUser } from '../../../../tests/tests.const';
import { ServiceDefinitionIdentifier } from '../../../__generated__/resolvers-types';
import { ServiceDefinitionId } from '../../../model/kanel/public/ServiceDefinition';
import { ServiceDefinitionDomain } from '../definition/service-definition.domain';
import { serviceContractDomain } from './service-configuration.domain';

describe('Service Contract Domain', () => {
  describe('isServiceConfigurationValid', () => {
    const context = contextBypassUser;
    it('should throw an error when service contract is not found', async () => {
      const call = serviceContractDomain.isServiceConfigurationValid(
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

      expect(serviceDefinition).toBeDefined();

      const configuration = {
        registerer_id: context.user.id,
        platform_id: uuidv4(),
        platform_url: 'http://example.com/',
        platform_title: 'Platform title',
        token: uuidv4(),
        platform_contract: 'EE',
      };

      const result = await serviceContractDomain.isServiceConfigurationValid(
        serviceDefinition.id,
        configuration
      );

      expect(result).toBeTruthy();
    });

    it('should return false when configuration does not match the schema specifications', async () => {
      const serviceDefinition =
        await ServiceDefinitionDomain.loadServiceDefinitionBy({
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
        });

      expect(serviceDefinition).toBeDefined();

      const result = await serviceContractDomain.isServiceConfigurationValid(
        serviceDefinition.id,
        {}
      );

      expect(result).toBeFalsy();
    });
  });
});
