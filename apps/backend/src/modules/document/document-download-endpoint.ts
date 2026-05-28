import cors from 'cors';
import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { requestContext } from '../../context/request.context';
import { DocumentId } from '../../model/kanel/public/Document';
import { UserLoadUserBy } from '../../model/user';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import { NotFoundError } from '../../utils/error/error.util';
import { OrganizationDomain } from '../organization-management/organization/organization.domain';
import { UserDomain } from '../organization-management/user/user-domain/user.domain';
import {
  extractPlatformToken,
  validateActivePlatformToken,
} from '../security-management/token/platform-token.util';
import { loadServiceDefinitionByServiceInstance } from '../service/instance/service-instance.domain';
import { telemetryApp } from '../telemetry/telemetry.app';
import {
  buildDownloadEvent,
  shouldSendEventForService,
} from '../telemetry/telemetry.helper';
import { DocumentDomain } from './domain/document.domain';
const documentDownloadRateLimiter = rateLimit({
  windowMs: 180 * 1000, // 3 minutes
  max: 10, // max 10 request per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

const loadUser = async (
  req: Request
): Promise<{
  user: UserLoadUserBy | null;
  isLoadedFromUserPlatformToken?: boolean;
}> => {
  const userLoadFromCookie: UserLoadUserBy | null = req.session.user;
  if (userLoadFromCookie) {
    return { user: userLoadFromCookie };
  }

  const user_platform_token = req.header('XTM-Hub-User-Platform-Token');
  if (!user_platform_token) {
    return { user: null };
  }

  const userLoadFromUserPlatformToken = await UserDomain.loadUserBy({
    'User.platform_token': user_platform_token,
  });
  return {
    user: userLoadFromUserPlatformToken,
    isLoadedFromUserPlatformToken: true,
  };
};

export const documentDownloadEndpoint = (app) => {
  app
    .options(`/document/get/:serviceInstanceId/:filename`, cors())
    .get(
      `/document/get/:serviceInstanceId/:filename`,
      cors(),
      documentDownloadRateLimiter,
      async (req: Request, res) => {
        const { attach } = req.query;
        const { user, isLoadedFromUserPlatformToken } = await loadUser(req);
        if (!user) {
          res.status(401).json({ message: 'You must be logged in' });
          return;
        }

        requestContext.update({ user });
        const token = extractPlatformToken(req);
        // check only if token is present to keep old OpenCTI versions compatibility
        if (isLoadedFromUserPlatformToken && token) {
          const isPlatformTokenValid = await validateActivePlatformToken(req);

          if (!isPlatformTokenValid) {
            return res
              .status(403)
              .json({ message: 'platform registration is not valid' });
          }
        }

        logApp.info('Downloading file:', { filename: req.params.filename });

        try {
          const document = await DocumentDomain.loadDocumentBy({
            id: fromGlobalId(
              Array.isArray(req.params.filename)
                ? req.params.filename[0]
                : req.params.filename
            ).id as DocumentId,
          });

          if (!document) {
            logApp.error(
              'Error while retrieving document: document not found.'
            );
            res.status(404).json({ message: 'Document not found' });
            throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
          }

          const stream = (await MinIOClient.downloadFile(
            document.minio_name
          )) as Readable;
          if (attach) {
            res.attachment(document.file_name);
          }

          const serviceDefinition =
            await loadServiceDefinitionByServiceInstance(
              document.service_instance_id
            );

          try {
            if (shouldSendEventForService(serviceDefinition.identifier)) {
              const selectedOrga = await OrganizationDomain.loadOrganizationBy({
                id: user.selected_organization_id,
              });

              const downloadEvent = await buildDownloadEvent(
                selectedOrga,
                user.id,
                serviceDefinition.identifier,
                document.id,
                document.name
              );
              await telemetryApp.sendTelemetryEvent(downloadEvent);
            }
          } catch (error) {
            logApp.error('Unable to send telemetry event for download', {
              error,
            });
          }

          stream.pipe(res);
        } catch (error) {
          logApp.error('Error while retrieving document: ', { error });
          res.status(404).json({ message: 'Document not found' });
          return;
        }
      }
    );
};
