import cors from 'cors';
import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { dbTx } from '../../../../knexfile';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { logApp } from '../../../utils/app-logger.util';
import { NotFoundError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { loadUserBy } from '../../users/users.domain';
import { serviceContractDomain } from '../contract/domain';
import { downloadFile } from './document-storage';
import { incrementDocumentsDownloads, loadDocumentBy } from './document.domain';

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

  const userLoadFromUserPlatformToken = await loadUserBy({
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

        const context: PortalContext = {
          user: user,
          serviceInstanceId: extractId<ServiceInstanceId>(
            req.params.serviceInstanceId
          ),
          req,
          res,
        };

        if (isLoadedFromUserPlatformToken) {
          const token = req.header('XTM-Hub-Platform-Token');
          if (!token) {
            res.status(403).json({ message: 'missing token in headers' });
            return;
          }

          const platformId = req.header('XTM-Hub-Platform-Id');
          if (!token) {
            res.status(403).json({ message: 'missing platform id in headers' });
            return;
          }

          const isPlatformTokenValid =
            await serviceContractDomain.loadActiveConfigurationByPlatformAndToken(
              context,
              { platformId, token }
            );
          if (!isPlatformTokenValid) {
            res
              .status(403)
              .json({ message: 'platform registration is not valid' });
            return;
          }
        }

        logApp.info('Downloading file:', { filename: req.params.filename });

        const trx = await dbTx();
        try {
          const [document] = await loadDocumentBy(context, {
            'Document.id': fromGlobalId(req.params.filename).id as DocumentId,
          });

          if (!document) {
            logApp.error(
              'Error while retrieving document: document not found.'
            );
            res.status(404).json({ message: 'Document not found' });
            throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
          }

          const stream = (await downloadFile(document.minio_name)) as Readable;
          if (attach) {
            res.attachment(document.file_name);
          }
          await incrementDocumentsDownloads(context, document, trx);
          await trx.commit();
          stream.pipe(res);
        } catch (error) {
          await trx.rollback();
          logApp.error('Error while retrieving document: ', error);
          res.status(404).json({ message: 'Document not found' });
          return;
        }
      }
    );
};
