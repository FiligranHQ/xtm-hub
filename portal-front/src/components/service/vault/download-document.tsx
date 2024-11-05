import { Button } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';
import {fileList$data} from "../../../../__generated__/fileList.graphql";
import {
    FileDownloadQuery
} from "@/components/service/vault/file.graphql";
import {useTranslations} from "next-intl";
import {fileDownloadQuery} from "../../../../__generated__/fileDownloadQuery.graphql";
import { useLazyLoadQuery } from 'react-relay';

interface DownloadDocumentProps {
    documentData: fileList$data;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
               documentData
       }) => {
    const t = useTranslations();

    const downloadedFile  = useLazyLoadQuery<fileDownloadQuery>(
        FileDownloadQuery,
        { documentId: documentData.id }
    );

    const handleDownload = () => {
        window.location.href = downloadedFile.document;
    };
    return (
       <Button
           variant="ghost"
           className="w-full justify-start"
           aria-label="Download File" onClick={handleDownload}>Download</Button>
    )
}

export default DownloadDocument;