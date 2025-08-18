import cors from 'cors';
import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { Readable } from 'stream';
import { dbTx, dbUnsecure } from '../../../../knexfile';
import Document, { DocumentId } from '../../../model/kanel/public/Document';
import { logApp } from '../../../utils/app-logger.util';
import { NotFoundError } from '../../../utils/error.util';
import { extractId } from '../../../utils/utils';
import { downloadFile } from './document-storage';

const documentDownloadRateLimiter = rateLimit({
  windowMs: 180 * 1000, // 3 minutes
  max: 10, // max 10 request per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// const loadUser = async (req: Request): Promise<UserLoadUserBy | null> => {
//   const user: UserLoadUserBy | null = req.session.user;
//   if (user) {
//     return user;
//   }
//   const platform_token = req.header('XTM-Hub-User-Platform-Token');
//   if (!platform_token) {
//     return null;
//   }
//
//   return loadUserBy({ 'User.platform_token': platform_token });
// };

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
};

export const documentDownloadEndpoint = (app) => {
  app.get(
    `/document/get/:serviceInstanceId/:filename`,
    cors(corsOptions),
    documentDownloadRateLimiter,
    async (req: Request, res) => {
      const { attach } = req.query;
      // const user = await loadUser(req);
      // if (!user) {
      //   res.status(401).json({ message: 'You must be logged in' });
      //   return;
      // }

      logApp.info('Downloading file:', { filename: req.params.filename });

      const trx = await dbTx();
      try {
        // const context: PortalContext = {
        //   user: user,
        //   serviceInstanceId: extractId<ServiceInstanceId>(
        //     req.params.serviceInstanceId
        //   ),
        //   req,
        //   res,
        // };

        // const [document] = await loadDocumentBy(context, {
        //   'Document.id': fromGlobalId(req.params.filename).id as DocumentId,
        // });
        const [document] = await dbUnsecure<Document>('Document')
          .where('Document.id', '=', extractId<DocumentId>(req.params.filename))
          .select('Document.*');

        if (!document) {
          logApp.error('Error while retrieving document: document not found.');
          res.status(404).json({ message: 'Document not found' });
          throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
        }

        const stream = (await downloadFile(document.minio_name)) as Readable;
        if (attach) {
          res.attachment(document.file_name);
        }
        // await incrementDocumentsDownloads(context, document, trx);
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
