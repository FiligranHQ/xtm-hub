import { Button } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';
import {
    DocumentDownloadQuery,
} from "@/components/service/vault/document.graphql";
import {useTranslations} from "next-intl";
import { useLazyLoadQuery } from 'react-relay';
import {documentDownloadQuery} from "../../../../__generated__/documentDownloadQuery.graphql";
import {documentsList$data} from "../../../../__generated__/documentsList.graphql";

interface DownloadDocumentProps {
    documentData: documentsList$data;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
               documentData
       }) => {
    const t = useTranslations();

    const downloadedDocument  = useLazyLoadQuery<documentDownloadQuery>(
        DocumentDownloadQuery,
        { documentId: documentData.id }
    );

    const handleDownload = () => {
        window.location.href = downloadedDocument.document;
    };
    return (
       <Button
           variant="ghost"
           className="w-full justify-start"
           aria-label="Download Document" onClick={handleDownload}>Download</Button>
    )
}

export default DownloadDocument;