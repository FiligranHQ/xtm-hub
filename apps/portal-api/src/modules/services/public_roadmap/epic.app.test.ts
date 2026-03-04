import { toGlobalId } from 'graphql-relay/node/node.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../knexfile';
import { SERVICES } from '../../../../tests/tests.const';
import {
  EpicOrdering,
  FiligranProduct,
  OrderingMode,
  Timeline,
} from '../../../__generated__/resolvers-types';
import Document from '../../../model/kanel/public/Document';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import * as ServiceInstanceDomain from '../service-instance.domain';
import { EpicApp } from './epic.app';

describe('EpicApp', () => {
  const minioFileMock = {
    minioName: 'epic-image.png',
    mimeType: 'image/png',
    fileName: 'epic-image.png',
  };

  beforeEach(async () => {
    vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
      minioFileMock,
    ]);
  });

  afterEach(async () => {
    // Clean up the Document and Epic tables before each test
    await db('Epic').delete();
    await db('Document').delete('*').where('file_name', '=', 'epic-image.png');
    vi.restoreAllMocks();
  });

  describe('createEpic', () => {
    it('should createEpic with correct data and return the created epic', async () => {
      const input = {
        epic: 'EPI-001',
        title: 'Test Epic',
        short_description: 'Short desc',
        description: 'Long description for the epic',
        is_active: true,
        product: FiligranProduct.OpenCti,
        timeline: Timeline.Now,
      };

      const createdEpic = await EpicApp.createEpic(input);

      expect(createdEpic).toBeDefined();
      expect(createdEpic.id).toBeDefined();
      expect(createdEpic.epic).toBe('EPI-001');
      expect(createdEpic.title).toBe('Test Epic');
      expect(createdEpic.product).toBe('OpenCTI');
      expect(createdEpic.is_active).toBe(true);

      // Verify in DB
      const dbEpic = await db<Epic>('Epic').where('id', createdEpic.id).first();
      expect(dbEpic).toBeDefined();
      expect(dbEpic?.epic).toBe('EPI-001');
      expect(dbEpic?.title).toBe('Test Epic');
    });

    it('should create an image document when upload is provided', async () => {
      vi.spyOn(
        ServiceInstanceDomain,
        'loadSubscribedServiceInstancesByIdentifier'
      ).mockResolvedValue([
        {
          service_instance_id: toGlobalId(
            'ServiceInstance',
            SERVICES.INSTANCES.INTEGRATIONS.ID
          ),
          organization_id: 'test-org-id',
          is_personal_space: false,
          configurations: [],
        },
      ] as never);

      const input = {
        epic: 'EPI-002',
        title: 'Epic with Image',
        short_description: 'Short desc',
        description: 'Long description for the epic',
        is_active: true,
        product: FiligranProduct.OpenCti,
        timeline: Timeline.Now,
      };

      const uploads = [
        {
          file: {} as never,
          promise: Promise.resolve({} as never),
        },
      ];

      const createdEpic = await EpicApp.createEpic(input, uploads);

      expect(createdEpic).toBeDefined();
      expect(createdEpic.id).toBeDefined();
      expect(createdEpic.document_id).toBeDefined();

      // Verify document was created in DB
      const dbDocument = await db<Document>('Document')
        .where('id', createdEpic.document_id)
        .first();

      expect(dbDocument).toBeDefined();
      expect(dbDocument?.file_name).toBe('epic-image.png');
      expect(dbDocument?.minio_name).toBe('epic-image.png');
      expect(dbDocument?.mime_type).toBe('image/png');
      expect(dbDocument?.type).toBe('image');
      expect(dbDocument?.description).toBe('Epic illustration');
      expect(dbDocument?.active).toBe(true);
      expect(dbDocument?.source_type).toBe('internal');
    });
  });

  describe('updateEpic', () => {
    it('should update the specified epic with the provided data and return the updated epic', async () => {
      // Create an epic first
      const createdEpic = await EpicApp.createEpic({
        epic: 'EPI-003',
        title: 'Original Title',
        short_description: 'Original short',
        description: 'Original long',
        product: FiligranProduct.OpenAev,
        timeline: Timeline.Next,
      });

      // Update it
      const updateInput = {
        title: 'Updated Title',
        short_description: 'Updated short description',
        is_active: true,
      };

      const updatedEpic = await EpicApp.updateEpic(
        createdEpic.id as EpicId,
        updateInput
      );

      expect(updatedEpic).toBeDefined();
      expect(updatedEpic?.title).toBe('Updated Title');
      expect(updatedEpic?.short_description).toBe('Updated short description');
      expect(updatedEpic?.is_active).toBe(true);
      // Original values should be preserved
      expect(updatedEpic?.epic).toBe('EPI-003');
      expect(updatedEpic?.description).toBe('Original long');

      // Verify in DB
      const dbEpic = await db<Epic>('Epic')
        .where('title', 'Updated Title')
        .first();
      expect(dbEpic?.title).toBe('Updated Title');
      expect(dbEpic?.is_active).toBe(true);
    });
  });

  describe('deleteEpic', () => {
    it('should delete the specified epic and return the deleted epic', async () => {
      const createdEpic = await EpicApp.createEpic({
        epic: 'EPI-005',
        title: 'Epic to Delete',
        short_description: 'Short',
        description: 'Long',
        product: FiligranProduct.OpenCti,
        timeline: Timeline.Next,
      });

      expect(createdEpic.id).toBeDefined();

      // Delete the epic
      const deletedEpic = await EpicApp.deleteEpic(createdEpic.id as EpicId);

      expect(deletedEpic).toBeDefined();
      expect(deletedEpic?.id).toBe(createdEpic.id);
      expect(deletedEpic?.epic).toBe('EPI-005');
    });
  });

  describe('loadEpics', () => {
    it('should return epics with pagination information using first and orderBy parameters', async () => {
      // Create multiple epics
      await EpicApp.createEpic({
        epic: 'EPI-006',
        title: 'Epic 1',
        short_description: 'Short 1',
        description: 'Long 1',
        product: FiligranProduct.XtmHub,
        timeline: Timeline.Now,
        is_active: true,
      });

      await EpicApp.createEpic({
        epic: 'EPI-007',
        title: 'Epic 2',
        short_description: 'Short 2',
        description: 'Long 2',
        product: FiligranProduct.XtmHub,
        timeline: Timeline.Now,
        is_active: true,
      });

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Epic,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toBeDefined();
      expect(epicsConnection.edges.length).toStrictEqual(2);
      expect(epicsConnection.pageInfo).toBeDefined();
      expect(epicsConnection.pageInfo.hasNextPage).toBeDefined();
      expect(epicsConnection.pageInfo.hasPreviousPage).toBeDefined();
      expect(
        epicsConnection.edges.some((e) => e.node.epic === 'EPI-006')
      ).toBeTruthy();
      expect(
        epicsConnection.edges.some((e) => e.node.epic === 'EPI-007')
      ).toBeTruthy();
    });

    it('should return empty connection when no epics exist', async () => {
      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Epic,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toBeDefined();
      expect(epicsConnection.edges.length).toStrictEqual(0);
      expect(epicsConnection.pageInfo).toBeDefined();
    });
  });
});
