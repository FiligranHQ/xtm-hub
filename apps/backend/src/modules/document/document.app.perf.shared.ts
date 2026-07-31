import { v4 as uuidv4 } from 'uuid';
import { describe } from 'vitest';
import { seedDocuments, TestHelper } from '../../../tests/helper/test.helper';
import {
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import { ServiceDefinitionId } from '../../model/kanel/public/ServiceDefinition';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';

interface CreateTestServiceInstanceOpts {
  serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  serviceDefinitionId: ServiceDefinitionId;
  slugSuffix: string;
}

export interface PerfTierAssertions {
  datasetSize: number;
  pageSize: number;
  maxAvgMs: number;
}

export interface PerfAssertions {
  small: PerfTierAssertions;
  large: PerfTierAssertions;
}

export const describePerf = describe.runIf(
  process.env.RUN_PERF_TESTS === 'true'
);

export function createPerfSuiteHelpers() {
  const runPrefix = `perf-${uuidv4().slice(0, 8)}`;
  const allCreatedDocumentIds: DocumentId[] = [];
  const allCreatedImageDocumentIds: DocumentId[] = [];
  const allCreatedServiceInstanceIds: ServiceInstanceId[] = [];

  const createTestServiceInstance = async (
    opts: CreateTestServiceInstanceOpts
  ): Promise<ServiceInstance> => {
    const slug = `${runPrefix}-${opts.serviceDefinitionIdentifier}-${opts.slugSuffix}`;
    const instance = await TestHelper.serviceInstance.create({
      name: `${runPrefix}-${opts.serviceDefinitionIdentifier}-${opts.slugSuffix}`,
      slug,
      service_definition_id: opts.serviceDefinitionId,
      creation_status: ServiceInstanceCreationStatus.Ready,
      public: true,
      tags: [],
      ordering: 99,
    });
    allCreatedServiceInstanceIds.push(instance.id);
    return instance;
  };

  const seed = async (
    count: number,
    opts: Omit<Parameters<typeof seedDocuments>[1], 'runPrefix'>
  ): Promise<void> => {
    const { documentIds, imageDocumentIds } = await seedDocuments(count, {
      ...opts,
      runPrefix,
    });
    allCreatedDocumentIds.push(...documentIds);
    allCreatedImageDocumentIds.push(...imageDocumentIds);
  };

  const cleanup = async (): Promise<void> => {
    await Promise.all(
      allCreatedImageDocumentIds.map((id) =>
        TestHelper.documentChildren.delete({ child_document_id: id })
      )
    );
    await Promise.all(
      allCreatedImageDocumentIds.map((id) => TestHelper.document.delete({ id }))
    );
    await Promise.all(
      allCreatedDocumentIds.map((id) => TestHelper.document.delete({ id }))
    );
    await Promise.all(
      allCreatedServiceInstanceIds.map((id) =>
        TestHelper.serviceInstance.delete({ id })
      )
    );
  };

  return {
    createTestServiceInstance,
    seed,
    cleanup,
  };
}
