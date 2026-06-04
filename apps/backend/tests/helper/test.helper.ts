import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import {
  CompetitorTier,
  FiligranProduct,
  Timeline,
} from '../../src/__generated__/resolvers-types';
import Competitor, {
  CompetitorId,
  CompetitorMutator,
} from '../../src/model/kanel/public/Competitor';
import Epic, { EpicId, EpicMutator } from '../../src/model/kanel/public/Epic';
import ObjectUseCase, {
  ObjectUseCaseMutator,
} from '../../src/model/kanel/public/ObjectUseCase';
import Organization, {
  OrganizationMutator,
} from '../../src/model/kanel/public/Organization';
import Subscription, {
  SubscriptionId,
  SubscriptionMutator,
} from '../../src/model/kanel/public/Subscription';
import UseCase, { UseCaseMutator } from '../../src/model/kanel/public/UseCase';
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
      return subscription;
    },
    delete: async (field: SubscriptionMutator) => {
      await db<Subscription>('Subscription').where(field).del();
    },
    load: async (field: SubscriptionMutator): Promise<Subscription> => {
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
    load: async (
      field: ObjectUseCaseMutator
    ): Promise<ObjectUseCase | undefined> => {
      return db<ObjectUseCase>('Object_UseCase').where(field);
    },
  },
};
