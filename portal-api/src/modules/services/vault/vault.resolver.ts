import {Resolvers} from "../../../__generated__/resolvers-types";
import {insertDocument, sendFileToS3} from "./vault.domain";
import {UserId} from "../../../model/kanel/public/User";
import {ServiceId} from "../../../model/kanel/public/Service";
import Document from "../../../model/kanel/public/Document";

const resolvers: Resolvers = {
    Mutation: {
        addVaultFile: async (_, opt, context) => {
            try {
                const minioName = await sendFileToS3(opt.file.file, context.user.id);
                const data: Document = {
                    uploader_id: context.user.id as UserId,
                    short_name: opt.shortName,
                    description: opt.description,
                    minio_name: minioName,
                    file_name: opt.file.file.filename,
                    service_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff' as ServiceId
                } as unknown as Document
                const [addedDocument] = await insertDocument(data)
                return addedDocument.file_name
            } catch (error) {
                console.error("Error while inserting file:", error);
                throw error
            }
        },

    }
}

export default resolvers;
