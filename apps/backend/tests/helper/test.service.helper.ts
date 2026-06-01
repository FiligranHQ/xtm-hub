import { v4 as uuidv4 } from 'uuid';
import { expect } from 'vitest';
import { db } from '../../knexfile';
import {
  PlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../../src/__generated__/resolvers-types';
import ServiceCapability, {
  ServiceCapabilityId,
  ServiceCapabilityMutator,
} from '../../src/model/kanel/public/ServiceCapability';
import ServiceConfiguration, {
  ServiceConfigurationMutator,
} from '../../src/model/kanel/public/ServiceConfiguration';
import ServiceDefinition, {
  ServiceDefinitionId,
  ServiceDefinitionMutator,
} from '../../src/model/kanel/public/ServiceDefinition';
import ServiceGroup, {
  ServiceGroupId,
  ServiceGroupMutator,
} from '../../src/model/kanel/public/ServiceGroup';
import ServiceGroupUser, {
  ServiceGroupUserMutator,
} from '../../src/model/kanel/public/ServiceGroupUser';
import ServiceInstance, {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../../src/model/kanel/public/ServiceInstance';
import SubscriptionCapability, {
  SubscriptionCapabilityMutator,
} from '../../src/model/kanel/public/SubscriptionCapability';
import { PlatformConfiguration } from '../../src/modules/registration/registration.domain';
import { contextRegistererUserSecondOrga } from '../tests.const';

export const mockPlatformConfig: PlatformConfiguration = {
  registerer_id: contextRegistererUserSecondOrga.user.id,
  platform_id: 'test-platform',
  platform_title: 'Test Platform',
  platform_url: 'https://test.com',
  platform_contract: PlatformContract.Ee,
  platform_version: '1.0.0',
  last_connectivity_check: new Date(),
  token: 'test-token',
};

export const TestServiceHelper = {
  serviceDefinition: {
    load: async (
      field: ServiceDefinitionMutator
    ): Promise<ServiceDefinition> => {
      return db<ServiceDefinition>('ServiceDefinition')
        .where(field)
        .select('*')
        .first();
    },
    create: async (
      data?: Partial<ServiceDefinition>
    ): Promise<ServiceDefinition> => {
      const [serviceDefinition] = await db<ServiceDefinition>(
        'ServiceDefinition'
      )
        .insert({
          id: uuidv4() as ServiceDefinitionId,
          name: 'Default name serviceDefinition',
          identifier: ServiceDefinitionIdentifier.OpenctiRegistration,
          ...data,
        })
        .returning('*');
      expect(serviceDefinition).toBeDefined();
      return serviceDefinition;
    },
    delete: async (field: ServiceDefinitionMutator) => {
      await db<ServiceDefinition>('ServiceDefinition').where(field).del();
    },
  },
  serviceCapability: {
    create: async (
      data?: ServiceCapabilityMutator
    ): Promise<ServiceCapability> => {
      const [serviceCapability] = await db<ServiceCapability>(
        'Service_Capability'
      )
        .insert({
          id: uuidv4() as ServiceCapabilityId,
          name: 'RANDOM SERVICE CAPABILITY',
          description: 'This is a short description',
          ...data,
        })
        .returning('*');
      return serviceCapability;
    },
    delete: async (field: ServiceCapabilityMutator) => {
      await db<ServiceCapability>('Service_Capability').where(field).del();
    },
  },
  serviceConfiguration: {
    create: async (
      data?: Partial<ServiceConfiguration>
    ): Promise<ServiceConfiguration> => {
      const [serviceConfiguration] = await db<ServiceConfiguration>(
        'Service_Configuration'
      )
        .insert({
          service_instance_id: uuidv4() as ServiceInstanceId,
          config: JSON.stringify(mockPlatformConfig),
          status: ServiceConfigurationStatus.Active,
          ...data,
        })
        .returning('*');
      expect(serviceConfiguration).toBeDefined();
      return serviceConfiguration;
    },
    delete: async (field: ServiceConfigurationMutator) => {
      await db<ServiceConfiguration>('Service_Configuration')
        .where(field)
        .del();
    },
    load: async (
      field: ServiceConfigurationMutator
    ): Promise<ServiceConfiguration | undefined> => {
      return db<ServiceConfiguration>('Service_Configuration')
        .where(field)
        .select('*')
        .first();
    },
  },
  serviceInstance: {
    create: async (
      data?: Partial<ServiceInstance>
    ): Promise<ServiceInstance> => {
      const [serviceInstance] = await db<ServiceInstance>('ServiceInstance')
        .insert({
          id: uuidv4() as ServiceInstanceId,
          name: 'Default name serviceInstance',
          tags: [],
          ...data,
        })
        .returning('*')
        .onConflict()
        .ignore();
      return serviceInstance;
    },
    delete: async (field: ServiceInstanceMutator) => {
      await db<ServiceInstance>('ServiceInstance').where(field).del();
    },
    load: async (
      field: ServiceInstanceMutator
    ): Promise<ServiceInstance | undefined> => {
      return db<ServiceInstance>('ServiceInstance')
        .where(field)
        .select('*')
        .first();
    },
  },
  serviceGroup: {
    create: async (data?: ServiceGroupMutator): Promise<ServiceGroup> => {
      const [serviceGroup] = await db<ServiceGroup>('ServiceGroup')
        .insert({
          id: uuidv4() as ServiceGroupId,
          name: 'Analyst',
          ...data,
        })
        .returning('*')
        .onConflict()
        .ignore();
      return serviceGroup;
    },
    load: async (
      field: ServiceGroupMutator
    ): Promise<ServiceGroup[] | undefined> => {
      return db<ServiceGroup[]>('ServiceGroup').where(field).select('*');
    },
    delete: async (field: ServiceGroupMutator) => {
      await db<ServiceGroup>('ServiceGroup').where(field).del();
    },
  },
  serviceGroupUser: {
    create: async (
      data?: ServiceGroupUserMutator
    ): Promise<ServiceGroupUser> => {
      const [serviceGroupUser] = await db<ServiceGroupUser>('ServiceGroup_User')
        .insert({
          ...data,
        })
        .returning('*')
        .onConflict()
        .ignore();
      return serviceGroupUser;
    },
    load: async (
      field: ServiceGroupUserMutator
    ): Promise<ServiceGroupUser[] | undefined> => {
      return db<ServiceGroupUser[]>('ServiceGroup_User')
        .where(field)
        .select('*');
    },
    delete: async (field: ServiceGroupUserMutator) => {
      await db<ServiceGroupUser>('ServiceGroup_User').where(field).del();
    },
  },
  subscriptionCapability: {
    delete: async (field: SubscriptionCapabilityMutator) => {
      await db<SubscriptionCapability>('Subscription_Capability')
        .where(field)
        .delete();
    },
  },
};
