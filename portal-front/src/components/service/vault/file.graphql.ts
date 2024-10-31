import {graphql} from "react-relay";

export const FileAddMutation = graphql`
    mutation fileAddMutation($file: Upload, $description: String) {
        addFile(file: $file, description: $description)
    }
`;

export const FileExistsQuery = graphql`
query fileExistsQuery($fileName: String) {
    fileExists(fileName: $fileName) 
}`
