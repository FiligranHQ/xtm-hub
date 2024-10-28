import {insertFileInMinio, UploadedFile} from "./file-storage";
import config from "config";
import Document from '../../../model/kanel/public/Document';
import {dbUnsecure} from "../../../../knexfile";
import {createDocument, getFileName, loadUnsecureDocumentsBy} from "./vault.helper";

export const sendFileToS3 = async (file: UploadedFile, userId: string) => {
    const fullMetadata = {
        mimetype: file.mimetype,
        filename: file.filename,
        encoding: file.encoding,
        Uploadinguserid: userId,
    }

    const fileParams = {
        Bucket: config.get('minio.bucketName'),
        Key: getFileName(file.filename),
        Body: file.createReadStream(),
        Metadata: fullMetadata
    }

    return await insertFileInMinio(fileParams);
}

export const passOldDocumentsIntoInactive = async(existingDocuments: Document[]) => {
    const documentIds = existingDocuments.map(doc => doc.id);
    await dbUnsecure<Document>('Document')
        .whereIn('id', documentIds)
        .update({ active: false })
        .returning('*');
}

export const insertDocument = async(documentData: Document) => {
    const existingDocuments = await loadUnsecureDocumentsBy( {file_name: documentData.file_name})
    if(existingDocuments.length >0) {
        passOldDocumentsIntoInactive(existingDocuments)
    }

    return createDocument(documentData)

}
