import {graphql} from "react-relay";

export const vaultFile = graphql`
    mutation vaultAddFileMutation($file: Upload) {
        vaultFile(file: $file)
    }
`;