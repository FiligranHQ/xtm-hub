import cors from 'cors';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import { Readable } from 'stream';
import { requestContext } from '../../context/request.context';
import { DocumentId } from '../../model/kanel/public/Document';
import ServiceDefinition from '../../model/kanel/public/ServiceDefinition';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import { NotFoundError } from '../../utils/error/error.util';
import { extractId } from '../../utils/utils';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
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
        requestContext.update({ user });
        const document = await DocumentDomain.loadDocumentBy({
          id: extractId<DocumentId>(req.params.filename),
        });
        if (!document) {
          logApp.error(
            `VISUALIZE Error while retrieving document: document not found. Required documentId: ${fromGlobalId(req.params.filename).id}`
          );
          res.status(404).json({ message: 'Document not found' });
          throw NotFoundError('DOCUMENT_NOT_FOUND_ERROR');
        }
        if (!document.minio_name) {
          logApp.error(
            `VISUALIZE Error - Invalid document - Missing name for ${document.id}`
          );
          return res.status(404).json({ message: 'Invalid document' });
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
        const serviceInstanceId = extractId<ServiceInstanceId>(
          req.params.serviceInstanceId
        );
        // Check if the user is authorized to access the document
        const serviceDefinition =
          (await ServiceInstanceDomain.loadServiceDefinitionByServiceInstance(
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
        const documentId = extractId<DocumentId>(req.params.documentId);
        const document = await DocumentDomain.loadDocumentBy({
          id: documentId,
        });

        if (!document?.mime_type?.startsWith('image/')) {
          logApp.error(
            `Document not found. Required documentId: ${documentId}`
          );
          return res.status(404).json({ message: 'Document not found' });
        }

        if (!document.minio_name) {
          logApp.error(`Invalid document - Missing name for ${documentId}`);
          return res.status(404).json({ message: 'Invalid document' });
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
