import Document, {DocumentMutator} from "../../../model/kanel/public/Document";
import {dbUnsecure} from "../../../../knexfile";

export const getFileName = (fileName: string) => {
    const splitName = fileName.split('.')
    const nameWithoutExtension = splitName[0]
    const extensionName = splitName[1]
    return `${nameWithoutExtension}${Date.now()}.${extensionName}`
}


export const loadUnsecureDocumentsBy = async(field: DocumentMutator): Promise<Document[]> => {
    return dbUnsecure<Document>( 'Document').where(field).select('*') as unknown as Document[]
}

export const createDocument = async(documentData): Promise<Document> => {
    return dbUnsecure<Document>('Document')
        .insert(documentData)
        .returning('*');
}

export const deleteDocuments = async() => {
    return dbUnsecure<Document>('Document').delete('*')
}