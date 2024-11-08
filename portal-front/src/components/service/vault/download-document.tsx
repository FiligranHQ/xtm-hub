import { DocumentDownloadQuery } from '@/components/service/vault/document.graphql';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { documentDownloadQuery } from '../../../../__generated__/documentDownloadQuery.graphql';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';

interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
  closeMenu?: () => void;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
  documentData,
  closeMenu,
}) => {
  const t = useTranslations();

  const downloadedDocument = useLazyLoadQuery<documentDownloadQuery>(
    DocumentDownloadQuery,
    { documentId: documentData.id }
  );

  const handleDownload = () => {
    window.location.href = downloadedDocument.document ?? '';
    if (closeMenu) {
      closeMenu();
    }
  };
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      aria-label="Download Document"
      onClick={handleDownload}>
      Download
    </Button>
  );
};

export default DownloadDocument;
