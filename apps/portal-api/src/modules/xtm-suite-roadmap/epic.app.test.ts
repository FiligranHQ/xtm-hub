import { toGlobalId } from 'graphql-relay/node/node.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../knexfile';
import { SERVICES, TEST_ORGANIZATIONS } from '../../../tests/tests.const';
import {
  EpicOrdering,
  EpicType,
  FiligranProduct,
  OrderingMode,
  ServiceDefinitionIdentifier,
  Timeline,
} from '../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../model/kanel/public/Document';
import Epic, { EpicId } from '../../model/kanel/public/Epic';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { MinIOClient } from '../../thirdparty/minio/client';
import { DocumentApp } from '../document/document.app';
import * as DocumentUploadsHelper from '../document/document.uploads.helper';
import { DocumentDomain } from '../document/domain/document.domain';
import * as ServiceInstanceDomain from '../services/service-instance.domain';
import { EpicApp } from './epic.app';
import { EpicDomain } from './epic.domain';

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
        title: 'Test Epic',
        short_description: 'Short desc',
        description: 'Long description for the epic',
        active: true,
        product: FiligranProduct.Opencti,
        timeline: Timeline.Now,
      };

      const createdEpic = await EpicApp.createEpic(input, []);

      expect(createdEpic).toMatchObject({
        id: expect.anything(),
        title: 'Test Epic',
        product: FiligranProduct.Opencti,
        active: true,
      });

      // Verify in DB
      const dbEpic = await db<Epic>('Epic').where('id', createdEpic.id).first();
      expect(dbEpic).toMatchObject({
        title: 'Test Epic',
      });
    });

    it('should create an image document when upload is provided', async () => {
      vi.spyOn(
        ServiceInstanceDomain,
        'loadSubscribedServiceInstancesByIdentifier'
      ).mockResolvedValue([
        {
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          organization_id: 'test-org-id',
          is_personal_space: false,
          configurations: [],
        },
      ] as never);

      const input = {
        title: 'Epic with Image',
        short_description: 'Short desc',
        description: 'Long description for the epic',
        active: true,
        product: FiligranProduct.Opencti,
        timeline: Timeline.Now,
      };

      const uploads = [
        {
          file: {} as never,
          promise: Promise.resolve({} as never),
        },
      ];

      const createdEpic = await EpicApp.createEpic(input, uploads);

      expect(createdEpic).toMatchObject({
        id: expect.anything(),
        document_id: expect.anything(),
      });

      // Verify document was created in DB
      const dbDocument = await db<Document>('Document')
        .where('id', createdEpic.document_id)
        .first();

      expect(dbDocument).toMatchObject({
        file_name: 'epic-image.png',
        minio_name: 'epic-image.png',
        mime_type: 'image/png',
        type: 'image',
        description: 'Epic illustration',
        active: true,
        source_type: 'internal',
      });
    });

    it('should create an integration epic when is_integration is true', async () => {
      const input = {
        title: 'Integration Epic',
        short_description: 'Short desc',
        description: 'Long description for the integration epic',
        active: true,
        product: FiligranProduct.Opencti,
        timeline: Timeline.Now,
        is_integration: true,
      };

      const createdEpic = await EpicApp.createEpic(input, []);

      expect(createdEpic).toMatchObject({
        epic_type: EpicType.Integration,
      });

      // Verify in DB
      const dbEpic = await db<Epic>('Epic').where('id', createdEpic.id).first();
      expect(dbEpic?.epic_type).toBe(EpicType.Integration);
    });
  });

  describe('updateEpic', () => {
    it('should update the specified epic with the provided data and return the updated epic', async () => {
      // Create an epic first
      const createdEpic = await EpicApp.createEpic(
        {
          title: 'Original Title',
          short_description: 'Original short',
          description: 'Original long',
          product: FiligranProduct.Openaev,
          timeline: Timeline.Next,
        },
        []
      );

      // Update it
      const updateInput = {
        title: 'Updated Title',
        short_description: 'Updated short description',
        active: true,
      };

      const updatedEpic = await EpicApp.updateEpic(
        createdEpic.id as EpicId,
        updateInput,
        []
      );

      expect(updatedEpic).toMatchObject({
        title: 'Updated Title',
        short_description: 'Updated short description',
        active: true,
        description: 'Original long',
      });

      // Verify in DB
      const dbEpic = await db<Epic>('Epic')
        .where('title', 'Updated Title')
        .first();
      expect(dbEpic).toMatchObject({
        title: 'Updated Title',
        active: true,
      });
    });
    it('should update the specified epic with uploads and create a document', async () => {
      vi.spyOn(
        ServiceInstanceDomain,
        'loadSubscribedServiceInstancesByIdentifier'
      ).mockResolvedValue([
        {
          service_instance_id: SERVICES.INSTANCES.INTEGRATIONS.ID,
          organization_id: 'test-org-id',
          is_personal_space: false,
          configurations: [],
        },
      ] as never);

      const createdEpic = await EpicApp.createEpic(
        {
          title: 'Original Title',
          short_description: 'Original short',
          description: 'Original long',
          product: FiligranProduct.Openaev,
          timeline: Timeline.Next,
        },
        []
      );

      expect(createdEpic.document_id).toBeNull();

      const updateInput = {
        title: 'Updated Title with Image',
        short_description: 'Updated short description',
        active: true,
      };

      const uploads = [
        {
          file: {} as never,
          promise: Promise.resolve({} as never),
        },
      ];

      const updatedEpic = await EpicApp.updateEpic(
        createdEpic.id,
        updateInput,
        uploads
      );

      expect(updatedEpic).toMatchObject({
        title: 'Updated Title with Image',
        document_id: expect.anything(),
      });

      const dbDocument = await db<Document>('Document')
        .where('id', updatedEpic?.document_id)
        .first();

      expect(dbDocument).toMatchObject({
        file_name: 'epic-image.png',
      });
    });
  });

  describe('deleteEpic', () => {
    it('should delete the specified epic and return the deleted epic', async () => {
      const createdEpic = await EpicApp.createEpic(
        {
          title: 'Epic to Delete',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Next,
        },
        []
      );

      expect(createdEpic.id).toBeDefined();

      // Delete the epic
      const deletedEpic = await EpicApp.deleteEpic(createdEpic.id as EpicId);

      expect(deletedEpic).toMatchObject({
        id: createdEpic.id,
      });
    });
    it('should delete, when integration, the document and the minioFile as well', async () => {
      const mockDeleteFileInMinio = vi
        .spyOn(MinIOClient, 'deleteFile')
        .mockResolvedValueOnce();

      const document = await DocumentApp.createDocumentWithChildrenAndMetadata(
        {
          id: 'bc348e84-3635-46de-9b56-38db09c35f4d' as DocumentId,
          uploader_id: toGlobalId(
            'User',
            TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
          ),
          description: 'description',
          minio_name: 'minioName',
          file_name: 'filename',
          uploader_organization_id:
            'ba091095-418f-4b4f-b150-6c9295e232c4' as OrganizationId,
          service_instance_id: SERVICES.INSTANCES.CUSTOM_DASHBOARDS.ID,
          type: ServiceDefinitionIdentifier.OpenctiCustomDashboards,
        },
        []
      );
      const createdEpic = await EpicDomain.createEpic({
        title: 'Epic to Delete',
        short_description: 'Short',
        description: 'Long',
        product: FiligranProduct.Opencti,
        timeline: Timeline.Next,
        epic_type: EpicType.Integration,
        document_id: document.id,
      });

      // Delete the epic
      const deletedEpic = await EpicApp.deleteEpic(createdEpic?.id as EpicId);

      expect(deletedEpic).toMatchObject({
        id: createdEpic?.id,
      });
      expect(mockDeleteFileInMinio).toHaveBeenCalledTimes(1);
      const documentFromDB = await DocumentDomain.loadDocumentBy({
        file_name: 'filename',
      });
      expect(documentFromDB).toStrictEqual([]);
    });
  });

  describe('loadEpics', () => {
    it('should return epics with pagination information using first and orderBy parameters', async () => {
      // Create multiple epics
      await EpicApp.createEpic(
        {
          title: 'Epic 1',
          short_description: 'Short 1',
          description: 'Long 1',
          product: FiligranProduct.Xtmhub,
          timeline: Timeline.Now,
          active: true,
        },
        []
      );

      await EpicApp.createEpic(
        {
          title: 'Epic 2',
          short_description: 'Short 2',
          description: 'Long 2',
          product: FiligranProduct.Xtmhub,
          timeline: Timeline.Now,
          active: true,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toMatchObject({
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
      const titles = epicsConnection.edges.map((e) => e.node.title);

      expect(titles).toHaveLength(2);
      expect(titles).toEqual(expect.arrayContaining(['Epic 1', 'Epic 2']));
    });

    it('should return empty connection when no epics exist', async () => {
      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toMatchObject({
        pageInfo: expect.anything(),
      });
      expect(epicsConnection.edges).toHaveLength(0);
    });

    it('should return epics ordered in descending order when orderMode is Desc', async () => {
      // Create multiple epics
      await EpicApp.createEpic(
        {
          title: 'Epic A',
          short_description: 'Short A',
          description: 'Long A',
          product: FiligranProduct.Xtmhub,
          timeline: Timeline.Now,
          active: true,
        },
        []
      );

      await EpicApp.createEpic(
        {
          title: 'Epic B',
          short_description: 'Short B',
          description: 'Long B',
          product: FiligranProduct.Xtmhub,
          timeline: Timeline.Now,
          active: true,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Desc,
      });

      expect(epicsConnection.edges).toHaveLength(2);
      expect(epicsConnection.edges[0]?.node.title).toBe('Epic B');
      expect(epicsConnection.edges[1]?.node.title).toBe('Epic A');
    });

    it('should return only epics matching searchTerm on title', async () => {
      await EpicApp.createEpic(
        {
          title: 'Dashboard feature',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      await EpicApp.createEpic(
        {
          title: 'Connector improvement',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
        searchTerm: 'Dashboard',
      });

      expect(epicsConnection.edges).toHaveLength(1);
      expect(epicsConnection.edges[0]?.node.title).toBe('Dashboard feature');
    });

    it('should return epics matching searchTerm on epic code', async () => {
      await EpicApp.createEpic(
        {
          title: 'Some title',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      await EpicApp.createEpic(
        {
          title: 'Other title',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
        searchTerm: 'Othe',
      });

      expect(epicsConnection.edges).toHaveLength(1);
      expect(epicsConnection.edges[0]?.node.title).toBe('Other title');
    });

    it('should return epics matching searchTerm on description', async () => {
      await EpicApp.createEpic(
        {
          title: 'Title A',
          short_description: 'Short A',
          description: 'Improve the threat intelligence module',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      await EpicApp.createEpic(
        {
          title: 'Title B',
          short_description: 'Short B',
          description: 'Fix pagination bugs',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
        searchTerm: 'threat intelligence',
      });

      expect(epicsConnection.edges).toHaveLength(1);
      expect(epicsConnection.edges[0]?.node.title).toBe('Title A');
    });

    it('should return empty results when searchTerm matches nothing', async () => {
      await EpicApp.createEpic(
        {
          title: 'Some epic',
          short_description: 'Short',
          description: 'Long',
          product: FiligranProduct.Opencti,
          timeline: Timeline.Now,
        },
        []
      );

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Title,
        orderMode: OrderingMode.Asc,
        searchTerm: 'nonexistent',
      });

      expect(epicsConnection.edges).toHaveLength(0);
    });
  });
});
