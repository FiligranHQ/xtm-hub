import { Knex } from 'knex';
import { CreateCsvFeedInput } from '../../../__generated__/resolvers-types';
import { ObjectLabelObjectId } from '../../../model/kanel/public/ObjectLabel';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { extractId } from '../../../utils/utils';
import { addObjectLabel } from '../../settings/objectLabel/object-label.domain';
import { createDocument } from '../document/document.domain';
import { MinioFile } from '../document/document.helper';

export const createCsvFeed = async (
  inputData: CreateCsvFeedInput,
  file: MinioFile,
  context: PortalContext,
  trx: Knex.Transaction
) => {
  const [csvFeedInserted] = await createDocument(context, trx, {
    uploader_id: context.user.id,
    service_instance_id: context.serviceInstanceId as ServiceInstanceId,
    description: inputData.description,
    file_name: file.fileName,
    minio_name: file.minioName,
    active: inputData.active,
    name: inputData.name,
    mime_type: file.mimeType,
    short_description: inputData.short_description,
    uploader_organization_id: context.user.selected_organization_id,
    type: 'csv_feed',
  });

  if (inputData.labels?.length > 0) {
    await addObjectLabel(
      context,
      inputData.labels.map((label) => ({
        object_id: csvFeedInserted.id,
        label_id: extractId<ObjectLabelObjectId>(label),
      })),
      trx
    );
  }

  await trx.commit();

  return csvFeedInserted;
};
