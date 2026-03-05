import { v4 as uuidv4 } from 'uuid';
import {
  CreateEpicInput,
  DocumentSourceType,
  EpicConnection,
  EpicType,
  QueryEpicsArgs,
  UpdateEpicInput,
} from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { extractId } from '../../../utils/utils';
import { processUploads, Upload } from '../document/document.uploads.helper';
import { DocumentDomain } from '../document/domain/document.domain';
import { loadSubscribedServiceInstancesByIdentifier } from '../service-instance.domain';
import { EpicDomain } from './epic.domain';

export const EpicApp = {
  loadEpics: async (opts: Partial<QueryEpicsArgs>): Promise<EpicConnection> => {
    return EpicDomain.loadEpics(opts);
  },
  createEpic: async (
    input: CreateEpicInput,
    uploads: Upload[]
  ): Promise<Epic> => {
    const { user } = requestContext.require();

    const [serviceInstance] = await loadSubscribedServiceInstancesByIdentifier(
      user.id,
      'public_roadmap'
    );
    const { is_integration, ...restInput } = input;
    let createdDocument;
    if (uploads) {
      const files = await processUploads(
        uploads,
        extractId<ServiceInstanceId>(serviceInstance.service_instance_id)
      );
      createdDocument = await DocumentDomain.createDocument(
        {
          service_instance_id: extractId<ServiceInstanceId>(
            serviceInstance.service_instance_id
          ),
          description: 'Epic illustration',
          file_name: files[0].fileName,
          minio_name: files[0].minioName,
          active: true,
          mime_type: files[0].mimeType,
          type: 'image',
          source_type: DocumentSourceType.Internal,
        },
        []
      );
    }

    const epicData: Partial<Epic> = {
      ...restInput,
      id: uuidv4() as EpicId,
      uploader_id: user.id,
      created_at: new Date(),
      epic_type: is_integration ? EpicType.Integration : EpicType.Other,
      document_id: createdDocument?.id,
    };
    return EpicDomain.createEpic(epicData);
  },
  updateEpic: async (id: EpicId, input: UpdateEpicInput) => {
    const { user } = requestContext.require();
    const epicData: Partial<Epic> = {
      ...input,
      id: uuidv4() as EpicId,
      updater_id: user.id,
      updated_at: new Date(),
    };
    return EpicDomain.updateEpic(id, epicData);
  },
  deleteEpic: async (id: EpicId) => {
    const [epics] = await EpicDomain.loadEpicsBy({ id: id });
    await EpicDomain.deleteEpicBy({ id });
    return epics;
  },
};
