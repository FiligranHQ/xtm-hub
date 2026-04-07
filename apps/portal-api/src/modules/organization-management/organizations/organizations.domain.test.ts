import { v4 as uuidv4 } from 'uuid';
import { beforeAll, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  ServiceInstanceCreationStatus,
  ServiceInstanceJoinType,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
} from '../../../model/kanel/public/Subscription';
import { UserId } from '../../../model/kanel/public/User';
import {
  contextBypassUser,
  SERVICES,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  loadOrganizationsByUser,
  loadUserByOrganization,
  organizationDomain,
} from './organizations.domain';

describe('OrganizationsDomain', () => {
  describe('loadOrganizationsByUser', () => {
    it('should return the user organizations when user exists', async () => {
      const organizations = await loadOrganizationsByUser(
        contextBypassUser.user.id
      );

      expect(organizations.length).toBe(2);
    });

    it('should return the user organizations when user exists', async () => {
      const userId = uuidv4() as UserId;
      const organizations = await loadOrganizationsByUser(userId);

      expect(organizations.length).toBe(0);
    });
  });

  describe('loadUserByOrganization', () => {
    it('should return the user of organization when user exists', async () => {
      const users = await loadUserByOrganization(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID
      );

      expect(users.length).toBe(2);
    });

    it('should return empty user list of organization when user is not in organization', async () => {
      const orgaId = uuidv4() as OrganizationId;
      const users = await loadUserByOrganization(orgaId);

      expect(users.length).toBe(0);
    });
  });

  describe('loadOrganizationSubscribedToServiceInstance', () => {
    const serviceInstanceId = uuidv4() as ServiceInstanceId;
    beforeAll(async () => {
      await db('ServiceInstance').insert([
        {
          id: serviceInstanceId,
          name: 'Service instance',
          description: '',
          creation_status: ServiceInstanceCreationStatus.Ready,
          public: false,
          join_type: ServiceInstanceJoinType.JoinAuto,
          tags: [],
          service_definition_id: SERVICES.DEFINITIONS.OPENCTI_REGISTRATION.ID,
        },
      ]);
    });
    it('should return null when organization is not subscribed to service instance', async () => {
      const result =
        await organizationDomain.loadOrganizationSubscribedToServiceInstance(
          serviceInstanceId
        );

      expect(result).toBeFalsy();
    });

    it('should return organization when it is subscribed to service instance', async () => {
      await db<Subscription>('Subscription').insert({
        id: uuidv4() as SubscriptionId,
        service_instance_id: serviceInstanceId,
        organization_id: TEST_ORGANIZATIONS.FILIGRAN.ID,
      });

      const result =
        await organizationDomain.loadOrganizationSubscribedToServiceInstance(
          serviceInstanceId
        );

      expect(result?.id).toBe(TEST_ORGANIZATIONS.FILIGRAN.ID);
    });
  });
});
