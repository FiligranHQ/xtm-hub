import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { commitLocalUpdate, useRelayEnvironment } from 'react-relay';
import useDecodedParams from '@/hooks/use-decoded-params';
import { IconActionContext, IconActionsItem } from '@/components/ui/IconActions';
interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
  documentData,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const t = useTranslations();
  const { slug } = useDecodedParams();
  const environment = useRelayEnvironment();

  const setDownloadNumber = () => {
    commitLocalUpdate(environment, (store) => {
      const documentRecord = store.get(documentData.id);
      if (documentRecord) {
        const currentDownloadNumber: number =
          (documentRecord.getValue('download_number') as number) ?? 0;
        documentRecord.setValue(currentDownloadNumber + 1, 'download_number');
      }
    });
  };

  return (
    <IconActionsItem asChild>
      <a
        href={`/document/get/${slug}/${documentData.id}?attach=1`}
        onClick={(e) => {
          setDownloadNumber();
          e.stopPropagation();
          setMenuOpen(false);
        }}>
        {t('Utils.Download')}
      </a>
    </IconActionsItem>
  );
};

export default DownloadDocument;
