import {graphql} from "react-relay";

export const VaultFileMutation = graphql`
    mutation vaultAddFileMutation($file: Upload ) {
        addVaultFile(file: $file)
    }
`;

export const VaultDataFileMutation = graphql`
    mutation vaultAddDataFileMutation($input: AddVaultDataFileInput ) {
        addVaultDataFile(input: $input) {
            id
            file_name
            minio_name
        }
    }
`;