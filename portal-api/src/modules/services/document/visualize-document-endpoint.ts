import cors from 'cors';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { DocumentMutator } from '../../../model/kanel/public/Document';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { downloadFile } from './document-storage';
import { loadDocumentBy } from './document.domain';

export const documentVisualizeEndpoint = (app) => {
  app.get(
    `/document/visualize/:serviceInstanceId/:filename`,
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
          'Document.id': fromGlobalId(req.params.filename).id,
        } as DocumentMutator);
        if (!document) {
          logApp.error(
            'VISUALIZE Error while retrieving document: document not found. Required documentId: ',
            fromGlobalId(req.params.filename).id
          );
          res.status(404).json({ message: 'Document not found' });
          return;
        }
        const stream = (await downloadFile(document.minio_name)) as Readable;

        res.setHeader('Content-Type', document.mime_type);
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${document.file_name}"`
        );

        stream.pipe(res);
      } catch (error) {
        logApp.error('Error while retrieving document VISUALIZE: ', error);
        res.status(404).json({ message: 'Document not found' });
        return;
      }
    }
  );
};
