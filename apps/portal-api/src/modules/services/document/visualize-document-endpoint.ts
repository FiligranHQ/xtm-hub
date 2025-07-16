import cors from 'cors';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { PortalContext } from '../../../model/portal-context';
import { logApp } from '../../../utils/app-logger.util';
import { NotFoundError } from '../../../utils/error.util';
import { getServiceDefinition } from '../service-instance.domain';
import { downloadFile } from './document-storage';
import { loadDocumentBy } from './document.domain';

export const documentVisualizeEndpoint = (app) => {
  app.get(
    `/document/visualize/:serviceInstanceId/:filename`,
    cors(),
    async (req, res) => {
      const { user } = req.session;
      if (!user) {
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
        });
        if (!document) {
          logApp.error(
            `VISUALIZE Error while retrieving document: document not found. Required documentId: ${fromGlobalId(req.params.filename).id}`
          );
          res.status(404).json({ message: 'Document not found' });
          throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
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
      }
    }
  );

  app.get(
    '/document/images/:serviceInstanceId/:documentId',
    cors(),
    async (req, res) => {
      try {
        // Check if the user is authorized to access the document
        const serviceDefinition = (await getServiceDefinition(
          { req, res } as PortalContext,
          fromGlobalId(req.params.serviceInstanceId).id
        )) as ServiceDefinition;
        if (!serviceDefinition) {
          logApp.error(
            `Service definition not found. Required: ${fromGlobalId(req.params.serviceInstanceId).id}`
          );
          return res
            .status(404)
            .json({ message: 'Service definition not found' });
        }

        // Only allow requests on public services
        if (!serviceDefinition.public) {
          logApp.error(
            `Service definition not found. Required: ${fromGlobalId(req.params.serviceInstanceId).id}`
          );
          return res
            .status(404)
            .json({ message: 'Service definition not found' });
        }

        const [document] = await loadDocumentBy(
          { req, res } as PortalContext,
          {
            'Document.id': fromGlobalId(req.params.documentId).id,
          },
          { unsecured: true }
        );

        if (!document || !document.mime_type.startsWith('image/')) {
          logApp.error(
            `Document not found. Required documentId: ${req.params.documentId}`
          );
          return res.status(404).json({ message: 'Document not found' });
        }
        const stream = (await downloadFile(document.minio_name)) as Readable;

        res.setHeader('Content-Type', document.mime_type);
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${document.file_name}"`
        );

        stream.pipe(res);
      } catch (error) {
        console.error(error);
        logApp.error('Error while retrieving document VISUALIZE: ', error);
        res.status(404).json({ message: 'Document not found' });
      }
    }
  );
};
