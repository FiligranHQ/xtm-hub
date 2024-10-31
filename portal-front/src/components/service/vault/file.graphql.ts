import {graphql} from "react-relay";

export const FileAddMutation = graphql`
    mutation fileAddMutation($file: Upload, $shortName: String, $description: String) {
        addFile(file: $file, shortName: $shortName, description: $description)
    }
`;

export const FileExistsQuery = graphql`
query fileExistsQuery($fileName: String) {
    fileExists(fileName: $fileName) 
}`
