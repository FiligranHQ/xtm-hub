import { CsvFeedCreateInput } from '../../../../__generated__/resolvers-types';
import {
  DocumentId,
  DocumentMutator,
} from '../../../../model/kanel/public/Document';
import { ObjectLabelObjectId } from '../../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../../model/portal-context';
import { extractId } from '../../../../utils/utils';
import { addObjectLabel } from '../../../settings/objectLabel/object-label.domain';
import { createDocument } from '../document.domain';
import { normalizeDocumentName } from '../document.helper';

export const createCsvFeed = async (
  inputData: CsvFeedCreateInput,
  document,
  minioName: string,
  fileName: string,
  context: PortalContext,
  trx
) => {
  const [csvFeedInserted] = await addDocumentCsvFeed(
    context,
    trx,
    inputData,
    document,
    minioName
  );

  if (inputData.labels?.length > 0) {
    await addObjectLabelForCsvFeeds(
      context,
      trx,
      inputData.labels,
      csvFeedInserted.id
    );
  }

  return csvFeedInserted;
};

export const addDocumentCsvFeed = async (
  context: PortalContext,
  trx,
  inputData,
  document,
  minioName: string
) => {
  const data: DocumentMutator = {
    uploader_id: context.user.id,
    service_instance_id: context.serviceInstanceId as ServiceInstanceId,
    description: inputData.description,
    file_name: normalizeDocumentName(document.file.filename),
    minio_name: minioName,
    active: inputData.active,
    name: inputData.name,
    mime_type: document.file.mime_type,
    short_description: inputData.short_description,
    uploader_organization_id: context.user.selected_organization_id,
    type: 'csv_feed',
  };

  return await createDocument(context, trx, data);
};

export const addObjectLabelForCsvFeeds = async (
  context: PortalContext,
  trx,
  labels: string[],
  csvFeedDocumentId: DocumentId
) => {
  const dataLabel = labels.map((label) => {
    return {
      object_id: csvFeedDocumentId,
      label_id: extractId<ObjectLabelObjectId>(label),
    };
  });
  await addObjectLabel(context, dataLabel, trx);
};
