import {Resolvers} from "../../../__generated__/resolvers-types";
import {createDocument, sendFileToS3} from "./vault.domain";
import {UserId} from "../../../model/kanel/public/User";
import {ServiceId} from "../../../model/kanel/public/Service";

const resolvers: Resolvers = {
    Mutation: {
        addVaultFile: async (_, opt, context) => {
            try {
                return await sendFileToS3(opt.file.file, context.user.id);
            } catch (error) {
                console.error("Error while inserting file:", error);
                throw error
            }
        },
        addVaultDataFile: async(_, {input}, context) => {
            const data = {
                uploader_id: context.user.id as UserId,
                short_name: input.shortName,
                description: input.description,
                minio_name: input.minioName,
                file_name: input.fileName,
                service_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff' as ServiceId
            }
            const [addedDocument] = await createDocument(data, input.fileName)
            return addedDocument
        }
    }
}

export default resolvers;
