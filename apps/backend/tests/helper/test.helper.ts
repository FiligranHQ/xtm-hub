import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import {
  CompetitorTier,
  FiligranProduct,
  ManifestType,
  Timeline,
} from '../../src/__generated__/resolvers-types';
import Competitor, {
  CompetitorId,
  CompetitorMutator,
} from '../../src/model/kanel/public/Competitor';
import Epic, { EpicId, EpicMutator } from '../../src/model/kanel/public/Epic';
import ManifestRebuildQueue, {
  ManifestRebuildQueueId,
  ManifestRebuildQueueInitializer,
  ManifestRebuildQueueMutator,
} from '../../src/model/kanel/public/ManifestRebuildQueue';
import ObjectUseCase, {
  ObjectUseCaseInitializer,
  ObjectUseCaseMutator,
} from '../../src/model/kanel/public/ObjectUseCase';
import OneClickDeployment, {
  OneClickDeploymentMutator,
} from '../../src/model/kanel/public/OneClickDeployment';
import Organization, {
  OrganizationMutator,
} from '../../src/model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../src/model/kanel/public/Subscription';
import UseCase, {
  UseCaseInitializer,
  UseCaseMutator,
} from '../../src/model/kanel/public/UseCase';
import { ManifestRebuildQueueStatus } from '../../src/modules/shareable-resource/manifest/manifest.consts';
import { TEST_ORGANIZATIONS } from '../tests.const';
import {
  mockPlatformConfig,
  TestPlatformConfigurationHelper,
} from './test-platform-configuration.helper';
import { TestDeploymentHelper } from './test.deployment.helper';
import { TestDocumentHelper } from './test.document.helper';
import { TestNewsfeedHelper } from './test.newsfeed.helper';
import { TestServiceHelper } from './test.service.helper';
import { TestUserHelper } from './test.user.helper';

export { seedDocuments } from './perf/test.document.perf.helper';
export type {
  SeedDocumentsOpts,
  SeedDocumentsResult,
} from './perf/test.document.perf.helper';
export { measureAvgDuration } from './perf/test.perf.helper';
export { mockPlatformConfig };

export const TestHelper = {
  ...TestDocumentHelper,
  ...TestServiceHelper,
  ...TestPlatformConfigurationHelper,
  ...TestUserHelper,
  ...TestDeploymentHelper,
  ...TestNewsfeedHelper,
  subscription: {
    create: async (data?: Partial<Subscription>): Promise<Subscription> => {
      const [subscription] = await db<Subscription>('Subscription')
        .insert({
          id: uuidv4() as SubscriptionId,
          ...data,
        })
        .returning('*');
      return subscription!;
    },
    delete: async (field: SubscriptionMutator) => {
      await db<Subscription>('Subscription').where(field).del();
    },
    load: async (
      field: SubscriptionMutator
    ): Promise<Subscription | undefined> => {
      return db<Subscription>('Subscription').where(field).select('*').first();
    },
    loadAll: async (field: SubscriptionMutator): Promise<Subscription[]> => {
      return db<Subscription[]>('Subscription').where(field).select('*');
    },
  },
  organization: {
    load: async (
      field: OrganizationMutator
    ): Promise<Organization | undefined> => {
      return db<Organization>('Organization').where(field).select('*').first();
    },
    delete: async (field: OrganizationMutator) => {
      await db<Organization>('Organization').where(field).del();
    },
  },
  oneClickDeployment: {
    loadAll: async (
      field: OneClickDeploymentMutator = {}
    ): Promise<OneClickDeployment[]> => {
      return db<OneClickDeployment[]>('OneClickDeployment')
        .where(field)
        .select('*')
        .orderBy('deployed_at', 'desc');
    },
  },
  competitor: {
    create: async (
      data?: CompetitorMutator
    ): Promise<Competitor | undefined> => {
      const [competitor] = await db<Competitor>('Competitor')
        .insert({
          id: uuidv4() as CompetitorId,
          name: TEST_ORGANIZATIONS.FILIGRAN.NAME,
          tier: CompetitorTier.Tier1,
          domain: TEST_ORGANIZATIONS.FILIGRAN.DOMAINS.FIRST,
          ...data,
        })
        .returning('*');
      return competitor;
    },
    delete: async (field: CompetitorMutator) => {
      await db<Competitor>('Competitor').where(field).del();
    },
    load: async (field: CompetitorMutator): Promise<Competitor | undefined> => {
      return db<Competitor>('Competitor').where(field).select('*').first();
    },
  },
  epic: {
    create: async (data?: EpicMutator): Promise<Epic | undefined> => {
      const [epic] = await db<Epic>('Epic')
        .insert({
          id: uuidv4() as EpicId,
          title: 'Test Epic',
          short_description: 'Short desc',
          description: 'Long description for the epic',
          active: true,
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
          ...data,
        })
        .returning('*');
      return epic;
    },
    delete: async (field: EpicMutator) => {
      await db<Epic>('Epic').where(field).del();
    },
    load: async (field: EpicMutator): Promise<Epic | undefined> => {
      return db<Epic>('Epic').where(field).select('*').first();
    },
  },
  useCase: {
    create: async (data: UseCaseInitializer): Promise<UseCase> => {
      const [useCase] = await db<UseCase>('UseCase')
        .insert(data)
        .returning('*');
      return useCase!;
    },
    delete: async (field: UseCaseMutator) => {
      await db<UseCase>('UseCase').where(field).del();
    },
    load: async (field: UseCaseMutator): Promise<UseCase | undefined> => {
      return db<UseCase>('UseCase').where(field).select('*').first();
    },
    loadAll: async (field: UseCaseMutator): Promise<UseCase[] | undefined> => {
      return db<UseCase[]>('UseCase').where(field).select('*');
    },
  },
  objectUseCase: {
    insert: async (
      data: ObjectUseCaseInitializer | ObjectUseCaseInitializer[]
    ): Promise<void> => {
      await db<ObjectUseCase>('Object_UseCase').insert(data);
    },
    delete: async (field: ObjectUseCaseMutator): Promise<void> => {
      await db<ObjectUseCase>('Object_UseCase').where(field).del();
    },
    load: async (
      field: ObjectUseCaseMutator
    ): Promise<ObjectUseCase | undefined> => {
      return db<ObjectUseCase>('Object_UseCase').where(field);
    },
  },
  manifestRebuildQueue: {
    create: async (
      data?: Partial<ManifestRebuildQueueInitializer>
    ): Promise<ManifestRebuildQueue> => {
      const [row] = await db<ManifestRebuildQueue>('ManifestRebuildQueue')
        .insert({
          id: uuidv4() as ManifestRebuildQueueId,
          product: 'opencti',
          version: '6.4.0',
          type: ManifestType.Connector,
          status: ManifestRebuildQueueStatus.Pending,
          ...data,
        })
        .returning('*');
      return row!;
    },
    delete: async (field: ManifestRebuildQueueMutator) => {
      await db<ManifestRebuildQueue>('ManifestRebuildQueue').where(field).del();
    },
    load: async (
      field: ManifestRebuildQueueMutator
    ): Promise<ManifestRebuildQueue | undefined> => {
      return db<ManifestRebuildQueue>('ManifestRebuildQueue')
        .where(field)
        .select('*')
        .first();
    },
    loadAll: async (
      field: ManifestRebuildQueueMutator
    ): Promise<ManifestRebuildQueue[]> => {
      return db<ManifestRebuildQueue[]>('ManifestRebuildQueue')
        .where(field)
        .select('*');
    },
  },
};
