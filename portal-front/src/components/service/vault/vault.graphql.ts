import {graphql} from "react-relay";

export const VaultFileMutation = graphql`
    mutation vaultAddFileMutation($file: Upload, $shortName: String, $description: String) {
        addVaultFile(file: $file, shortName: $shortName, description: $description)
    }
`;
