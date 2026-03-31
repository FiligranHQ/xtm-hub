import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { expect, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../knexfile';
import {
  DocumentMetadataKeyCode,
  DocumentMetadata as DocumentMetadataResolverType,
  IntegrationType,
  PlatformContract,
  ServiceConfigurationStatus,
  ServiceDefinitionIdentifier,
} from '../src/__generated__/resolvers-types';
import Document, {
  DocumentId,
  DocumentMutator,
} from '../src/model/kanel/public/Document';
import ServiceConfiguration, {
  ServiceConfigurationMutator,
} from '../src/model/kanel/public/ServiceConfiguration';
import ServiceDefinition, {
  ServiceDefinitionId,
  ServiceDefinitionMutator,
} from '../src/model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
  ServiceInstanceMutator,
} from '../src/model/kanel/public/ServiceInstance';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../src/model/kanel/public/Subscription';
import { UserId } from '../src/model/kanel/public/User';
import UserService, {
  UserServiceId,
  UserServiceMutator,
} from '../src/model/kanel/public/UserService';
import {
  contextRegistererUserSecondOrga,
  TEST_ORGANIZATIONS,
} from './tests.const';
import { PlatformConfiguration } from '../src/modules/registration/registration.domain';
import { DocumentApp } from '../src/modules/document/document.app';
import { Upload } from '../src/modules/document/document.uploads.helper';
import { INTEGRATION_SERVICE_INSTANCE_ID } from '../src/modules/document/opencti/integrations/integrations.model';

const mockFileUpload: FileUpload = {
  filename: 'test-image.png',
  mimetype: 'image/png',
  encoding: '7bit',
  createReadStream: vi.fn(),
};

const mockUpload = {
  file: mockFileUpload,
  promise: Promise.resolve(mockFileUpload),
};

export const mockPlatformConfig: PlatformConfiguration = {
  registerer_id: contextRegistererUserSecondOrga.user.id,
  platform_id: 'test-platform',
  platform_title: 'Test Platform',
  platform_url: 'https://test.com',
  platform_contract: PlatformContract.Ee,
  platform_version: '1.0.0',
  token: 'test-token',
};
export const TestHelper = {
  document: {
    createWholeDocument: async ({
      name = 'myCsvFeed',
      description = 'description',
      short_description = 'short_description',
      slug = 'slug',
      active = true,
      uploader_id = TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      metadata = [
        {
          key: DocumentMetadataKeyCode.IntegrationType,
          value: IntegrationType.CsvFeed,
        },
        { key: DocumentMetadataKeyCode.FeedUrl, value: 'https://example.com' },
      ],
      serviceInstanceId = INTEGRATION_SERVICE_INSTANCE_ID,
      sourceDocument = mockUpload,
    }: {
      name?: string;
      description?: string;
      short_description?: string;
      slug?: string;
      active?: boolean;
      uploader_id?: UserId;
      metadata?: DocumentMetadataResolverType[];
      serviceInstanceId?: ServiceInstanceId;
      sourceDocument?: Upload;
    }): Promise<Document> => {
      const document = await DocumentApp.createDocument({
        input: {
          name,
          description,
          short_description,
          slug,
          active,
          uploader_id,
        },
        metadata,
        serviceInstanceId,
        sourceDocument,
      });

      expect(document).toBeDefined();

      return document!;
    },
    create: async (data?: DocumentMutator): Promise<Document> => {
      const [document] = await db<Document>('Document')
        .insert({
          id: uuidv4() as DocumentId,
          ...data,
        })
        .returning('*');
      expect(document).toBeDefined();
      return document;
    },
    load: async (documentId: DocumentId): Promise<Document | undefined> => {
      return db<Document>('Document')
        .where('id', '=', documentId)
        .select('*')
        .first();
    },
    delete: async (field: DocumentMutator) => {
      await db<Document>('Document').where(field).del();
    },
  },
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
  },
  subscription: {
    create: async (data?: Partial<Subscription>): Promise<Subscription> => {
      const [subscription] = await db<Subscription>('Subscription')
        .insert({
          id: uuidv4() as SubscriptionId,
          ...data,
        })
        .returning('*');
      return subscription;
    },
    delete: async (field: SubscriptionMutator) => {
      await db<Subscription>('Subscription').where(field).del();
    },
  },
  user_Service: {
    load: async (
      field: UserServiceMutator
    ): Promise<UserService | undefined> => {
      return db<UserService>('User_Service').where(field).select('*').first();
    },
    create: async (
      data?: Partial<UserService>
    ): Promise<UserService | undefined> => {
      const [userService] = await db<UserService>('User_Service')
        .insert({
          id: uuidv4() as UserServiceId,
          ...data,
        })
        .returning('*');
      return userService;
    },
    delete: async (field: UserServiceMutator) => {
      await db<UserService>('User_Service').where(field).del();
    },
  },
};
