import Document, {DocumentMutator} from "../../../model/kanel/public/Document";
import {dbUnsecure} from "../../../../knexfile";

export const getFileName = (fileName: string) => {
    const splitName = fileName.split('.')
    const nameWithoutExtension = splitName[0]
    const extensionName = splitName[1]
    return `${nameWithoutExtension}_${Date.now()}.${extensionName}`
}

export const normalizeFileName = (fileName: string): string => {
    return fileName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[&\/\\#,+()$~%'":*?!<>{}]/g, '-');
}

export const checkFileExists = async (fileName: string) => {
    const documents: Document[] = await loadUnsecureDocumentsBy({file_name: fileName})
    return documents.length > 0;
}


export const loadUnsecureDocumentsBy = async(field: DocumentMutator): Promise<Document[]> => {
    return dbUnsecure<Document>( 'Document').where(field).select('*') as unknown as Document[]
}

export const createDocument = async(documentData): Promise<Document[]> => {
    const document = dbUnsecure<Document>('Document')
        .insert(documentData)
        .returning('*') as unknown as Document[];
    return document;
}

export const deleteDocuments = async() => {
    return dbUnsecure<Document>('Document').delete('*')
}