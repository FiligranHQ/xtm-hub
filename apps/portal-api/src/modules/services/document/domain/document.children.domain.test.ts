import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../../knexfile';
import { SERVICES } from '../../../../../tests/tests.const';
import { DocumentSourceType } from '../../../../__generated__/resolvers-types';
import Document, { DocumentId } from '../../../../model/kanel/public/Document';
import DocumentChildren from '../../../../model/kanel/public/DocumentChildren';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { ADMIN_UUID } from '../../../../portal.const';
import { MinIOClient } from '../../../../thirdparty/minio/client';
import * as DocumentUploadsHelper from '../document.uploads.helper';
import { Upload } from '../document.uploads.helper';
import { DocumentChildrenDomain } from './document.children.domain';

async function insertDocument({
  id,
  type = 'image',
  source_type = DocumentSourceType.External,
  minio_name = 'minio-file',
  mime_type = 'image/png',
  service_instance_id = null,
  ...rest
}: Partial<Document> & { id?: DocumentId } = {}): Promise<DocumentId> {
  const realId = id ?? (uuidv4() as DocumentId);
  await db<Document>('Document').insert({
    id: realId,
    type,
    source_type,
    minio_name,
    mime_type,
    service_instance_id,
    name: 'Test Image',
    uploader_id: ADMIN_UUID,
    ...rest,
  });
  return realId;
}

describe('DocumentChildrenDomain', () => {
  let parentId: DocumentId;
  let childId1: DocumentId;
  let childId2: DocumentId;
  let unrelatedChildId: DocumentId;
  const serviceInstanceId: ServiceInstanceId =
    SERVICES.INSTANCES.INTEGRATIONS.ID;
  let oldExternalId: DocumentId;
  let oldInternalId: DocumentId;
  let upload: Upload;
  let minioFileMock: { minioName: string; mimeType: string; fileName: string };

  beforeEach(async () => {
    await db<DocumentChildren>('Document_Children').delete();
    await db<Document>('Document').delete();
    parentId = uuidv4() as DocumentId;
    childId1 = await insertDocument({});
    childId2 = await insertDocument({ minio_name: 'minio-file-2' });
    unrelatedChildId = await insertDocument({
      type: 'image',
      source_type: DocumentSourceType.Internal,
      minio_name: 'not-external',
    });
    // Insert parent document (not deleted by the tested method)
    await insertDocument({
      id: parentId,
      type: 'folder',
      source_type: DocumentSourceType.Internal,
      minio_name: 'parent-folder',
      service_instance_id: serviceInstanceId,
    });
  });

  afterEach(async () => {
    await db<DocumentChildren>('Document_Children').delete();
    await db<Document>('Document').delete();

    vi.restoreAllMocks();
  });

  describe('deleteExternalImages', () => {
    beforeEach(async () => {
      // Link children to parent
      await db<DocumentChildren>('Document_Children').insert([
        { parent_document_id: parentId, child_document_id: childId1 },
        { parent_document_id: parentId, child_document_id: childId2 },
        { parent_document_id: parentId, child_document_id: unrelatedChildId },
      ]);
    });

    it('should delete only external image children and return their ids and minio_names', async () => {
      const deleted =
        await DocumentChildrenDomain.deleteExternalImages(parentId);
      expect(Array.isArray(deleted)).toBe(true);
      expect(deleted.length).toBe(2);
      const deletedIds = deleted.map((d) => d.id);
      expect(deletedIds).toContain(childId1);
      expect(deletedIds).toContain(childId2);
      expect(deleted.find((d) => d.minio_name === 'minio-file')).toBeTruthy();
      expect(deleted.find((d) => d.minio_name === 'minio-file-2')).toBeTruthy();

      // Check DB: only unrelated child remains
      const remaining: Document[] = await db<Document>('Document').select('id');
      expect(remaining.length).toBe(2); // parent + unrelated child
      const remainingIds = remaining.map(({ id }) => id);
      expect(remainingIds).toContain(parentId);
      expect(remainingIds).toContain(unrelatedChildId);
    });

    it('should not delete anything if no external image children', async () => {
      // Remove external type from children
      await db<Document>('Document')
        .whereIn('id', [childId1, childId2])
        .update({ source_type: DocumentSourceType.Internal });
      const deleted =
        await DocumentChildrenDomain.deleteExternalImages(parentId);
      expect(deleted).toEqual([]);
      // All children remain
      const remaining = await db<Document>('Document').select('id');
      expect(remaining.length).toBe(4); // parent + 3 children
    });

    it('should not delete children of other parents', async () => {
      const otherParentId = uuidv4() as DocumentId;
      await insertDocument({
        id: otherParentId,
      });
      const otherChildId = await insertDocument({
        minio_name: 'other-minio',
        source_type: DocumentSourceType.External,
      });
      await db<DocumentChildren>('Document_Children').insert({
        parent_document_id: otherParentId,
        child_document_id: otherChildId,
      });
      const deleted =
        await DocumentChildrenDomain.deleteExternalImages(parentId);
      expect(deleted.length).toBe(2);
      // The other child should still exist
      const exists = await db<Document>('Document')
        .where('id', otherChildId)
        .first();
      expect(exists).toBeTruthy();
    });
  });

  describe('upsertExternalImage', () => {
    beforeEach(async () => {
      // Insert old external image child
      oldExternalId = await insertDocument({
        type: 'image',
        source_type: DocumentSourceType.External,
        minio_name: 'old-external',
        service_instance_id: serviceInstanceId,
      });
      // Insert old internal image child
      oldInternalId = await insertDocument({
        type: 'image',
        source_type: DocumentSourceType.Internal,
        minio_name: 'old-internal',
        service_instance_id: serviceInstanceId,
      });
      await db<DocumentChildren>('Document_Children').insert([
        { parent_document_id: parentId, child_document_id: oldExternalId },
        { parent_document_id: parentId, child_document_id: oldInternalId },
      ]);
      // Mock upload
      upload = {
        filename: 'new-image.png',
        mimetype: 'image/png',
        encoding: '7bit',
        createReadStream: () => undefined,
      } as unknown as Upload;
      minioFileMock = {
        minioName: 'new-minio',
        mimeType: 'image/png',
        fileName: 'new-image.png',
      };
      vi.spyOn(DocumentUploadsHelper, 'processUploads').mockResolvedValue([
        minioFileMock,
      ]);
      vi.spyOn(MinIOClient, 'deleteFile').mockResolvedValue(undefined);
    });

    it('should replace all external image children with the new upload and delete old MinIO files', async () => {
      // Insert a fake parent doc model
      const parentDoc = await db<Document>('Document')
        .where('id', parentId)
        .first();
      // upsertExternalImage expects a DocumentModel, so we use the DB row
      await DocumentChildrenDomain.upsertExternalImage(parentDoc, upload);
      // Only one external image child should remain
      const children: Document[] = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');

      const externalImages = children.filter(
        (c) => c.source_type === DocumentSourceType.External
      );
      expect(externalImages.length).toBe(1);
      expect(externalImages[0]!.minio_name).toBe('new-minio');
      // Internal image child should remain
      const internalImages = children.filter(
        (c) => c.source_type === DocumentSourceType.Internal
      );
      expect(internalImages.length).toBe(1);
      expect(internalImages[0]!.id).toBe(oldInternalId);
      // Old external image should be deleted
      const oldExternal = await db<Document>('Document')
        .where('id', oldExternalId)
        .first();
      expect(oldExternal).toBeUndefined();
      // MinIOClient.deleteFile should be called for old external image
      expect(MinIOClient.deleteFile).toHaveBeenCalledWith('old-external');
    });

    it('should work if there are no previous external images', async () => {
      // Remove all external images
      await db<Document>('Document')
        .where('id', oldExternalId)
        .update({ source_type: DocumentSourceType.Internal });
      const parentDoc = await db<Document>('Document')
        .where('id', parentId)
        .first();
      await DocumentChildrenDomain.upsertExternalImage(parentDoc, upload);
      const children: Document[] = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');
      const externalImages = children.filter(
        (c) => c.source_type === 'external'
      );
      expect(externalImages.length).toBe(1);
      expect(externalImages[0]!.minio_name).toBe('new-minio');
      // No MinIO file deletion should be called
      expect(MinIOClient.deleteFile).not.toHaveBeenCalled();
    });

    it('should not affect unrelated parents or children', async () => {
      const otherParentId = uuidv4() as DocumentId;
      await insertDocument({
        id: otherParentId,
      });
      const otherChildId = await insertDocument({
        minio_name: 'other-minio',
        source_type: 'external',
        service_instance_id: serviceInstanceId,
      });
      await db<DocumentChildren>('Document_Children').insert({
        parent_document_id: otherParentId,
        child_document_id: otherChildId,
      });
      const parentDoc = await db<Document>('Document')
        .where('id', parentId)
        .first();
      await DocumentChildrenDomain.upsertExternalImage(parentDoc, upload);
      // The other child should still exist
      const exists = await db<Document>('Document')
        .where('id', otherChildId)
        .first();
      expect(exists).toBeTruthy();

      // The other parent should still have its child
      const otherChildren = await db<DocumentChildren>(
        'Document_Children'
      ).where('parent_document_id', otherParentId);
      expect(otherChildren.length).toBe(1);
      expect(otherChildren[0].child_document_id).toBe(otherChildId);
    });
  });

  describe('createImageDocuments', () => {
    let parentId: DocumentId;
    let serviceInstanceId: ServiceInstanceId;
    beforeEach(async () => {
      await db<DocumentChildren>('Document_Children').delete();
      await db<Document>('Document').delete();
      parentId = await insertDocument({
        type: 'folder',
        source_type: DocumentSourceType.Internal,
      });
      serviceInstanceId = SERVICES.INSTANCES.INTEGRATIONS.ID;
    });

    it('should create a single image document with correct parent and metadata', async () => {
      const file = {
        fileName: 'img1.png',
        minioName: 'minio-img1',
        mimeType: 'image/png',
      };
      await DocumentChildrenDomain.createImageDocuments(
        parentId,
        serviceInstanceId,
        [file],
        DocumentSourceType.External
      );
      const children = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');
      expect(children.length).toBe(1);
      expect(children[0].file_name).toBe('img1.png');
      expect(children[0].minio_name).toBe('minio-img1');
      expect(children[0].mime_type).toBe('image/png');
      expect(children[0].source_type).toBe(DocumentSourceType.External);
      expect(children[0].service_instance_id).toBe(serviceInstanceId);
    });

    it('should create multiple image documents if multiple files are provided', async () => {
      const files = [
        {
          fileName: 'img1.png',
          minioName: 'minio-img1',
          mimeType: 'image/png',
        },
        {
          fileName: 'img2.jpg',
          minioName: 'minio-img2',
          mimeType: 'image/jpeg',
        },
      ];
      await DocumentChildrenDomain.createImageDocuments(
        parentId,
        serviceInstanceId,
        files,
        DocumentSourceType.Internal
      );
      const children = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');
      expect(children.length).toBe(2);
      const fileNames = children.map((c: Document) => c.file_name);
      expect(fileNames).toContain('img1.png');
      expect(fileNames).toContain('img2.jpg');
      children.forEach((c: Document) =>
        expect(c.source_type).toBe(DocumentSourceType.Internal)
      );
    });

    it('should do nothing if files array is empty', async () => {
      await DocumentChildrenDomain.createImageDocuments(
        parentId,
        serviceInstanceId,
        [],
        DocumentSourceType.External
      );
      const children = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');
      expect(children.length).toBe(0);
    });

    it('should default to internal source_type if not specified', async () => {
      const file = {
        fileName: 'img1.png',
        minioName: 'minio-img1',
        mimeType: 'image/png',
      };
      await DocumentChildrenDomain.createImageDocuments(
        parentId,
        serviceInstanceId,
        [file]
      );
      const children = await db<Document>('Document')
        .leftJoin(
          'Document_Children',
          'Document.id',
          'Document_Children.child_document_id'
        )
        .where('Document_Children.parent_document_id', parentId)
        .select('Document.*');
      expect(children.length).toBe(1);
      expect(children[0].source_type).toBe(DocumentSourceType.Internal);
    });
  });
});
