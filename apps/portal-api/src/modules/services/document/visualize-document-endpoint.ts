import cors from 'cors';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { requestContext } from '../../../context/request.context';
import ServiceDefinition from '../../../model/kanel/public/ServiceDefinition';
import { PortalContext } from '../../../model/portal-context';
import { MinIOClient } from '../../../thirdparty/minio/client';
import { logApp } from '../../../utils/app-logger.util';
import { NotFoundError } from '../../../utils/error/error.util';
import { loadServiceDefinitionByServiceInstance } from '../service-instance.domain';
import { DocumentDomain } from './domain/document.domain';

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
          req,
          res,
        };
        requestContext.update({ portalContext: context });
        const [document] = await DocumentDomain.loadDocumentBy({
          'Document.id': fromGlobalId(req.params.filename).id,
        });
        if (!document) {
          logApp.error(
            `VISUALIZE Error while retrieving document: document not found. Required documentId: ${fromGlobalId(req.params.filename).id}`
          );
          res.status(404).json({ message: 'Document not found' });
          throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
        }
        const stream = (await MinIOClient.downloadFile(
          document.minio_name
        )) as Readable;

        res.setHeader('Content-Type', document.mime_type);
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${document.file_name}"`
        );

        stream.pipe(res);
      } catch (error) {
        logApp.error('Error while retrieving document VISUALIZE: ', { error });
        res.status(404).json({ message: 'Document not found' });
      }
    }
  );

  app.get(
    '/document/images/:serviceInstanceId/:documentId',
    cors(),
    async (req, res) => {
      try {
        const serviceInstanceId = fromGlobalId(req.params.serviceInstanceId).id;
        // Check if the user is authorized to access the document
        const serviceDefinition = (await loadServiceDefinitionByServiceInstance(
          serviceInstanceId
        )) as ServiceDefinition;
        if (!serviceDefinition) {
          logApp.error(
            `Service definition not found. Required: ${serviceInstanceId}`
          );
          return res
            .status(404)
            .json({ message: 'Service definition not found' });
        }

        // Only allow requests on public services
        if (!serviceDefinition.public) {
          logApp.error(
            `Service definition not found. Required: ${serviceInstanceId}`
          );
          return res
            .status(404)
            .json({ message: 'Service definition not found' });
        }
        const documentId = fromGlobalId(req.params.documentId).id;
        const [document] = await DocumentDomain.loadDocumentBy({
          'Document.id': documentId,
        });

        if (!document || !document.mime_type.startsWith('image/')) {
          logApp.error(
            `Document not found. Required documentId: ${documentId}`
          );
          return res.status(404).json({ message: 'Document not found' });
        }
        const stream = (await MinIOClient.downloadFile(
          document.minio_name
        )) as Readable;

        res.setHeader('Content-Type', document.mime_type);
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${document.file_name}"`
        );

        stream.pipe(res);
      } catch (error) {
        logApp.error('Error while retrieving document VISUALIZE: ', { error });
        res.status(404).json({ message: 'Document not found' });
      }
    }
  );
};
