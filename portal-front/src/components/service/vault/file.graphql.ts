import {graphql} from "react-relay";

export const FileAddMutation = graphql`
    mutation fileAddMutation($file: Upload, $description: String, $connections: [ID!]!) {
        addFile(file: $file, description: $description) 
        @prependNode(connections: $connections, edgeTypeName: "DocumentEdge") {
            id
            description
            created_at
            file_name
        }
        
    }
`;

export const FileUpdateMutation = graphql`
    mutation fileUpdateMutation($documentId: ID, $newDescription: String) {
        editFile(documentId: $documentId, newDescription: $newDescription) {
            id
            file_name
            created_at
            description
        }
    }
`;

export const FileExistsQuery = graphql`
query fileExistsQuery($fileName: String) {
    fileExists(fileName: $fileName) 
}`

export const FileDownloadQuery = graphql`
    query fileDownloadQuery($documentId: ID) {
        document(documentId: $documentId)
    }
`
export const filesFragment = graphql`
    fragment fileList on Query
    @refetchable(queryName: "FilesPaginationQuery") {
        documents(
            first: $count
            after: $cursor
            orderBy: $orderBy
            orderMode: $orderMode
            filter: $filter
        ) {
            __id
            totalCount
            edges {
                node {
                    id
                    file_name
                    created_at
                    description
                }
            }
        }
    }
`

export const FileListQuery = graphql`
    query fileQuery(
        $count: Int!
        $cursor: ID
        $orderBy: DocumentOrdering!
        $orderMode: OrderingMode!
        $filter: String) {
            ...fileList
        }`
