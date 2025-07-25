import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { dbTx } from '../../../../knexfile';
import { DocumentId } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { NotFoundError } from '../../../utils/error.util';
import { downloadFile } from './document-storage';
import { incrementDocumentsDownloads, loadDocumentBy } from './document.domain';
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins except undefined (ex: curl ou Postman)
    callback(null, true);
  },
  credentials: true,
};

const documentDownloadRateLimiter = rateLimit({
  windowMs: 180 * 1000, // 3 minutes
  max: 10, // max 10 request per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});
export const documentDownloadEndpoint = (app) => {
  app.get(
    `/document/get/:serviceInstanceId/:filename`,
    cors(corsOptions),
    documentDownloadRateLimiter,
    async (req, res) => {
      const { user } = req.session;
      const { attach } = req.query;
      if (!user) {
        res.status(401).json({ message: 'You must be logged in' });
        return;
      }
      const trx = await dbTx();
      try {
        const context: PortalContext = {
          user: user,
          serviceInstanceId: fromGlobalId(req.params.serviceInstanceId)
            .id as ServiceInstanceId,
          req,
          res,
        };

        const [document] = await loadDocumentBy(context, {
          'Document.id': fromGlobalId(req.params.filename).id as DocumentId,
        });
        if (!document) {
          logApp.error('Error while retrieving document: document not found.');
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
