import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { Knex } from 'knex';
import { dbUnsecure } from '../../../../knexfile';
import { requestContext } from '../../../context/request.context';
import {
  DocumentId,
  default as DocumentModel,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { logApp } from '../../../utils/app-logger.util';
import { WithLabels } from '../../../utils/types';
import { extractId } from '../../../utils/utils';
import { telemetryApp } from '../../telemetry/telemetry.app';
import { TelemetryEventType } from '../../telemetry/telemetry.types';
import { OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE } from '../custom-dashboards/custom-dashboards.domain';
import { OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE } from '../integration-feeds/integration-feeds.model';
import { OPENAEV_SCENARIO_DOCUMENT_TYPE } from '../openaev-scenarios/openaev-scenarios.domain';
import {
  createDocument,
  loadDocumentById,
  loadSeoDocumentBySlug,
  sendFileToS3,
} from './document.domain';

export const BOOLEAN_METADATA = [
  'verified',
  'manager_supported',
  'playbook_supported',
];

export type Document = WithLabels<DocumentModel>;
export type FullDocumentMutator = Partial<DocumentModel> & {
  labels?: string[];
  parent_document_id?: DocumentId;
};

export interface UpdateDocumentDocuments {
  documentFile: MinioFile | undefined;
  newImages: MinioFile[];
  existingImages: string[];
}

export const getDocumentName = (documentName: string) => {
  const splitName = documentName.split('.');
  const nameWithoutExtension = splitName[0];
  const extensionName = splitName[1];
  return `${nameWithoutExtension}_${Date.now()}.${extensionName}`;
};

export const normalizeDocumentName = (documentName: string = ''): string => {
  return documentName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export interface MinioFile {
  minioName: string;
  fileName: string;
  mimeType: string;
}

export interface ExistingFile {
  id: string;
  file_name: string;
  name: string;
}

export interface Upload {
  file: FileUpload;
  promise: Promise<FileUpload>;
}

export const waitForUploads = async (uploads: Upload[] | Upload) => {
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await Promise.all(uploads.map((upload) => upload.promise));
};

export const processUploads = async (uploads: Upload[] | Upload) => {
  if (!Array.isArray(uploads)) {
    uploads = [uploads];
  }
  await waitForUploads(uploads);
  return Promise.all(uploads.map((doc: Upload) => createFileInMinIO(doc)));
};

export const processDocumentUpdateUploads = async (
  document: Upload[] | undefined,
  updateDocument: boolean,
  images: string[]
): Promise<UpdateDocumentDocuments> => {
  let documentFile: MinioFile;
  let newImages: MinioFile[] = [];
  if (document && document.length > 0) {
    await waitForUploads(document);
    const files = await Promise.all(
      document.map((doc: Upload) => createFileInMinIO(doc))
    );
    if (updateDocument) {
      documentFile = files.shift();
    }
    newImages = files;
  }

  return {
    documentFile,
    newImages,
    existingImages: images.map((imageId) => extractId<DocumentId>(imageId)),
  };
};

export const createFileInMinIO = async (
  jsonFile: Upload
): Promise<MinioFile> => {
  const { portalContext, user } = requestContext.require();
  const fileName = normalizeDocumentName(jsonFile.file.filename);
  const minioName = await sendFileToS3(
    jsonFile.file,
    fileName,
    user.id,
    portalContext.serviceInstanceId as ServiceInstanceId
  );
  return { minioName, fileName, mimeType: jsonFile.file.mimetype };
};

export const checkDocumentExists = async (
  documentName: string,
  serviceInstanceId: ServiceInstanceId
) => {
  const documents: Document[] = await loadUnsecureDocumentsBy({
    file_name: normalizeDocumentName(documentName),
    active: true,
    service_instance_id: serviceInstanceId,
  });
  return documents.length > 0;
};

export const loadUnsecureDocumentsBy = async (
  field: DocumentMutator
): Promise<Document[]> => {
  return dbUnsecure<Document[]>('Document').where(field).select('*');
};

export const uploadNewFile = async (document, trx: Knex.Transaction) => {
  if (!document || !document.file) {
    return;
  }
  const { portalContext, user } = requestContext.require();
  const minioName = await sendFileToS3(
    document.file,
    document.file.name,
    user.id,
    portalContext.serviceInstanceId as ServiceInstanceId
  );

  const data: FullDocumentMutator = {
    uploader_id: user.id,
    name: portalContext.serviceInstanceId,
    minio_name: minioName,
    file_name: document.file.name,
    service_instance_id: null,
    created_at: new Date(),
    mime_type: document.file.mimetype,
    type: 'service_picture',
  };

  return createDocument(data, [], trx);
};

export const deleteDocuments = async () => {
  return dbUnsecure<Document>('Document').delete('*');
};

export const deleteDocumentBy = async (field: DocumentMutator) => {
  return dbUnsecure<Document>('Document').where(field).delete('*');
};

export const updateDocumentWithCounters = async <T extends Document>(
  document: T
) => {
  let download_number = 0;
  let share_number = 0;
  try {
    [download_number, share_number] = await Promise.all([
      telemetryApp.countEventsByDocumentId(
        TelemetryEventType.DOWNLOAD,
        document.id
      ),
      telemetryApp.countEventsByDocumentId(
        TelemetryEventType.SHARE,
        document.id
      ),
    ]);
  } catch (error) {
    logApp.error('Unable to fetch counters from elastic search', error);
  }

  return {
    ...document,
    download_number,
    share_number,
  };
};

export const loadDocumentWithCountersById = async <T extends Document>(
  id: string,
  include_metadata: string[] = []
) => {
  const document: T = await loadDocumentById(id, include_metadata);
  return updateDocumentWithCounters(document);
};

export const loadSeoDocumentWithCountersBySlug = async <T extends Document>(
  type:
    | typeof OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE
    | typeof OPENCTI_CUSTOM_DASHBOARD_DOCUMENT_TYPE
    | typeof OPENAEV_SCENARIO_DOCUMENT_TYPE,
  slug: string,
  include_metadata: string[] = []
) => {
  const document: T = await loadSeoDocumentBySlug(type, slug, include_metadata);
  return updateDocumentWithCounters(document);
};
