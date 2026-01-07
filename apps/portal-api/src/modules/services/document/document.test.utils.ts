import { DocumentApp } from './document.app';
import {
  Document,
  FullDocumentMutator,
  loadDocumentsBy,
} from './document.helper';
import { DocumentDomain } from './domain/document.domain';

export const insertDocument = async (
  documentData: FullDocumentMutator
): Promise<Document> => {
  const existingDocuments = await loadDocumentsBy({
    file_name: documentData.file_name,
  });
  if (existingDocuments.length > 0) {
    void DocumentDomain.deactivateDocuments(
      existingDocuments.map(({ id }) => id)
    );
  }

  return DocumentApp.createDocumentWithChildrenAndMetadata<Document>(
    documentData,
    []
  );
};
