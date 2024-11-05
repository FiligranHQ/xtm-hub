import { Resolvers } from '../../../__generated__/resolvers-types';
import {downloadDocument, insertDocument, loadDocuments, sendFileToS3, updateDocument} from './file.domain';
import { UserId } from '../../../model/kanel/public/User';
import { ServiceId } from '../../../model/kanel/public/Service';
import Document from '../../../model/kanel/public/Document';
import { checkFileExists, normalizeFileName } from './file.helper';
import { fromGlobalId } from 'graphql-relay/node/node.js';
import {DocumentId} from '../../../model/kanel/public/Document';

const resolvers: Resolvers = {
  Mutation: {
    addFile: async (_, opt, context) => {
      try {
        const minioName = await sendFileToS3(opt.file.file, context.user.id);
        const data: Document = {
          uploader_id: context.user.id as UserId,
          description: opt.description,
          minio_name: minioName,
          file_name: normalizeFileName(opt.file.file.filename),
          service_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff' as ServiceId,
        } as unknown as Document;
        const [addedDocument] = await insertDocument(data);
        return addedDocument;
      } catch (error) {
        console.error('Error while inserting file:', error);
        throw error;
      }
    },
    editFile: async(_, {documentId, newDescription}, context) => {
      try {
        const [document] = await updateDocument(context, {description: newDescription}, fromGlobalId(documentId).id as DocumentId)
        return document;
      } catch (error) {
        console.error('Error while updating file:', error);
        throw error;
      }
    }
  },
  Query: {
    fileExists: async (_, input) => {
      try {
        return checkFileExists(input.fileName ?? '');
      } catch (error) {
        console.error('Error while fetching files:', error);
        throw error;
      }
    },
    documents: async(_, {first, after, orderMode, orderBy, filter}, context) => {
      return loadDocuments(context, {first, after, orderMode, orderBy}, filter);
    },
    document: async(_, {documentId}, context) => {
      return downloadDocument(context, fromGlobalId(documentId).id as DocumentId)
    }
  },
};

export default resolvers;
