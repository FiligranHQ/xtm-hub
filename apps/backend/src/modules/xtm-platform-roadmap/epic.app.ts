import { v4 as uuidv4 } from 'uuid';
import {
  CreateEpicInput,
  EpicConnection,
  EpicType,
  QueryEpicsArgs,
  ServiceDefinitionIdentifier,
  ServiceRestriction,
  UpdateEpicInput,
} from '../../__generated__/resolvers-types';
import portalConfig from '../../config';
import { requestContext } from '../../context/request.context';
import Epic, { EpicId } from '../../model/kanel/public/Epic';
import User from '../../model/kanel/public/User';
import { assertUserHasCapaOnService } from '../../security/guard';
import { sendMail } from '../../server/mail-service';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { nullsToUndefined } from '../../utils/typescript';
import {
  DocumentUploadsHelper,
  Upload,
} from '../document/document.uploads.helper';
import { DocumentDomain } from '../document/domain/document.domain';
import {
  loadServiceInstanceBy,
  loadSubscribedServiceInstancesByIdentifier,
} from '../service/instance/service-instance.domain';
import { EpicDomain } from './epic.domain';

const addImage = async (user: User, uploads: Upload[]) => {
  if (!uploads || uploads.length === 0) {
    return undefined;
  }
  const [serviceInstance] = await loadSubscribedServiceInstancesByIdentifier(
    user.id,
    ServiceDefinitionIdentifier.XtmPlatformRoadmap
  );
  if (serviceInstance) {
    const files = await DocumentUploadsHelper.processUploads(
      uploads,
      serviceInstance.service_instance_id
    );
    const imageFile = files[0];
    if (!imageFile) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return DocumentDomain.createDocument(
      {
        service_instance_id: serviceInstance.service_instance_id,
        description: 'Epic illustration',
        file_name: imageFile.fileName,
        minio_name: imageFile.minioName,
        active: true,
        mime_type: imageFile.mimeType,
        type: 'image',
        source_type: 'internal',
      },
      []
    );
  }
  return undefined;
};

export const EpicApp = {
  loadEpics: async (opts: Partial<QueryEpicsArgs>): Promise<EpicConnection> => {
    return EpicDomain.loadEpics(opts);
  },
  createEpic: async (
    input: CreateEpicInput,
    uploads: Upload[]
  ): Promise<Epic> => {
    const { user } = requestContext.require();

    const serviceInstance = await loadServiceInstanceBy({
      slug: 'xtm-platform-roadmap',
    });

    await assertUserHasCapaOnService(user, serviceInstance.id, [
      ServiceRestriction.Upsert,
    ]);

    const { is_integration, ...restInput } = input;
    const createdDocument = await addImage(user, uploads);

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
  updateEpic: async (id: EpicId, input: UpdateEpicInput, uploads: Upload[]) => {
    const { user } = requestContext.require();

    const serviceInstance = await loadServiceInstanceBy({
      slug: 'xtm-platform-roadmap',
    });
    await assertUserHasCapaOnService(user, serviceInstance.id, [
      ServiceRestriction.Upsert,
    ]);

    const { is_integration, ...restInput } = input;

    const createdDocument = await addImage(user, uploads);

    let oldEpic;
    if (createdDocument?.id) {
      oldEpic = await EpicDomain.loadEpicsBy({ id });
    }
    const epicData: Partial<Epic> = {
      ...nullsToUndefined(restInput),
      updater_id: user.id,
      updated_at: new Date(),
      epic_type: is_integration ? EpicType.Integration : EpicType.Other,
      ...(createdDocument && { document_id: createdDocument.id }),
    };
    const updatedEpic = await EpicDomain.updateEpic(id, epicData);
    if (
      oldEpic &&
      oldEpic.document_id &&
      createdDocument?.id !== oldEpic.document_id
    ) {
      // Remove old document from MinIO and DB
      const document = await DocumentDomain.loadDocumentBy({
        id: oldEpic.document_id,
      });
      await MinIOClient.deleteFile(document.minio_name);
      await DocumentDomain.deleteDocuments([oldEpic.document_id]);
    }
    return updatedEpic;
  },

  deleteEpic: async (id: EpicId) => {
    const { user } = requestContext.require();

    const serviceInstance = await loadServiceInstanceBy({
      slug: 'xtm-platform-roadmap',
    });

    await assertUserHasCapaOnService(user, serviceInstance.id, [
      ServiceRestriction.Delete,
    ]);

    const [epic] = await EpicDomain.loadEpicsBy({ id: id });
    await EpicDomain.deleteEpicBy({ id });
    if (epic.document_id) {
      const document = await DocumentDomain.loadDocumentBy({
        id: epic.document_id,
      });
      await MinIOClient.deleteFile(document.minio_name);
      await DocumentDomain.deleteDocuments([epic.document_id]);
    }
    return epic;
  },

  sendPublicRoadmapMonthlyReminder: async (): Promise<void> => {
    if (!portalConfig.enabled_emails.public_roadmap_monthly_reminder) {
      logApp.info(
        'Public roadmap monthly reminder email is disabled, skipping'
      );
      return;
    }
    await sendMail({
      to: 'product.managers@filigran.io',
      template: 'public_roadmap_monthly_reminder',
    });
  },
};
