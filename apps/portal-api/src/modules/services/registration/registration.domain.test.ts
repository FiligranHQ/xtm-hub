import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dbUnsecure } from '../../../../knexfile';
import {
  contextAdminUser,
  THALES_ORGA_ID,
} from '../../../../tests/tests.const';
import { OctiPlatformContract } from '../../../__generated__/resolvers-types';
import ServiceConfiguration from '../../../model/kanel/public/ServiceConfiguration';
import ServiceInstance from '../../../model/kanel/public/ServiceInstance';
import Subscription from '../../../model/kanel/public/Subscription';
import { PLATFORM_ORGANIZATION_UUID } from '../../../portal.const';
import { ErrorCode } from '../../common/error-code';
import { serviceContractDomain } from '../contract/domain';
import {
  OCTIPlatformConfiguration,
  registrationDomain,
} from './registration.domain';

describe('Registration domain', () => {
  let platformId: string;
  const token = uuidv4();
  const platformTitle = 'My OCTI platform';
  const platformUrl = 'http://example.com';
  const platformContract = OctiPlatformContract.Ee;
  const serviceDefinitionId = '5f769173-5ace-4ef3-b04f-2c95609c5b59';
  let configuration: OCTIPlatformConfiguration;

  beforeEach(() => {
    platformId = uuidv4();

    configuration = {
      enroller_id: contextAdminUser.user.id,
      platform_id: platformId,
      platform_url: platformUrl,
      platform_title: platformTitle,
      token,
      platform_contract: platformContract,
    };
  });

  describe('enrollNewInstance', () => {
    it('save registration data', async () => {
      await registrationDomain.enrollNewPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        serviceDefinitionId,
        configuration: {
          enroller_id: contextAdminUser.user.id,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          token,
        },
      });

      const serviceInstance = await dbUnsecure<ServiceInstance>(
        'ServiceInstance'
      )
        .where('name', '=', 'OpenCTI Platform')
        .select('*')
        .first();

      expect(serviceInstance).toBeDefined();

      const subscription = await dbUnsecure<Subscription>('Subscription')
        .where('service_instance_id', '=', serviceInstance.id)
        .select('*')
        .first();

      expect(subscription).toBeDefined();
      expect(subscription.organization_id).toBe(PLATFORM_ORGANIZATION_UUID);

      const serviceConfiguration = await dbUnsecure<ServiceConfiguration>(
        'Service_Configuration'
      )
        .where('service_instance_id', '=', serviceInstance.id)
        .select('*')
        .first();

      expect(serviceConfiguration).toBeDefined();
      const configuration = JSON.parse(
        JSON.stringify(serviceConfiguration.config)
      );

      expect(configuration.token).toBe(token);
      expect(configuration.enroller_id).toBe(contextAdminUser.user.id);
      expect(configuration.platform_id).toBe(platformId);
      expect(configuration.platform_title).toBe(platformTitle);
      expect(configuration.platform_url).toBe(platformUrl);
      expect(configuration.platform_contract).toBe(platformContract);
    });
  });

  describe('refreshExistingPlatform', () => {
    let serviceInstanceId: string;
    let subscriptionId: string;
    beforeEach(async () => {
      await registrationDomain.enrollNewPlatform(contextAdminUser, {
        organizationId: PLATFORM_ORGANIZATION_UUID,
        serviceDefinitionId,
        configuration: {
          enroller_id: contextAdminUser.user.id,
          platform_id: platformId,
          platform_url: platformUrl,
          platform_title: platformTitle,
          platform_contract: platformContract,
          token,
        },
      });

      const existingServiceConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(
          contextAdminUser,
          platformId
        );
      expect(existingServiceConfiguration).toBeDefined();
      serviceInstanceId = existingServiceConfiguration.service_instance_id;

      const subscription = await dbUnsecure<Subscription>('Subscription')
        .where('service_instance_id', '=', serviceInstanceId)
        .select('*')
        .first();

      expect(subscription).toBeDefined();
      subscriptionId = subscription.id;
    });

    afterEach(() => {
      subscriptionId = undefined;
      serviceInstanceId = undefined;
    });

    it('should refresh existing platform configuration', async () => {
      const newToken = uuidv4();
      await registrationDomain.refreshExistingPlatform(contextAdminUser, {
        configuration: {
          ...configuration,
          token: newToken,
        },
        serviceInstanceId,
        targetOrganizationId: PLATFORM_ORGANIZATION_UUID,
      });

      const updatedSubscription = await dbUnsecure<Subscription>('Subscription')
        .where('id', '=', subscriptionId)
        .select('*')
        .first();

      const existingServiceConfiguration =
        await serviceContractDomain.loadConfigurationByPlatform(
          contextAdminUser,
          platformId
        );
      expect(existingServiceConfiguration).toBeDefined();
      const parsedConfiguration = JSON.parse(
        JSON.stringify(existingServiceConfiguration.config as string)
      );
      expect(parsedConfiguration.token).toBe(newToken);

      expect(updatedSubscription).toBeDefined();
      expect(updatedSubscription.organization_id).toBe(
        PLATFORM_ORGANIZATION_UUID
      );
    });

    it('should prevent registration on another organization', async () => {
      const newToken = uuidv4();
      const call = registrationDomain.refreshExistingPlatform(
        contextAdminUser,
        {
          configuration: {
            ...configuration,
            token: newToken,
          },
          serviceInstanceId,
          targetOrganizationId: THALES_ORGA_ID,
        }
      );

      await expect(call).rejects.toThrow(
        ErrorCode.RegistrationOnAnotherOrganizationForbidden
      );
    });
  });
});
