import cors from 'cors';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import {
  DocumentId,
  DocumentMutator,
} from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { downloadFile } from './document-storage';
import { incrementDocumentsDownloads, loadDocumentBy } from './document.domain';

export const documentDownloadEndpoint = (app) => {
  app.get(
    `/document/get/:serviceInstanceId/:filename`,
    cors(),
    async (req, res) => {
      const { user } = req.session;
      if (!user || user.capabilities.length === 0) {
        res.status(401).json({ message: 'You must be logged in' });
        return;
      }
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
        } as DocumentMutator);
        if (!document) {
          logApp.error('Error while retrieving document: document not found.');
          res.status(404).json({ message: 'Document not found' });
          return;
        }

        const stream = (await downloadFile(document.minio_name)) as Readable;
        res.attachment(document.file_name);
        await incrementDocumentsDownloads(context, document);

        stream.pipe(res);
      } catch (error) {
        logApp.error('Error while retrieving document: ', error);
        res.status(404).json({ message: 'Document not found' });
        return;
      }
    }
  );
};
