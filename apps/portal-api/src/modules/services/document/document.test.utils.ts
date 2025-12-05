import {
  Document,
  FullDocumentMutator,
  loadUnsecureDocumentsBy,
} from './document.helper';
import { createDocument, DocumentDomain } from './domain/document.domain';

export const insertDocument = async (
  documentData: FullDocumentMutator
): Promise<Document> => {
  const existingDocuments = await loadUnsecureDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    void DocumentDomain.passOldDocumentsIntoInactive(existingDocuments);
  }

  return createDocument<Document>(documentData, []);
};
