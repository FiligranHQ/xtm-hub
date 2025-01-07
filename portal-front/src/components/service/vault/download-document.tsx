import { IconActionContext } from '@/components/ui/icon-actions';
import useDecodedParams from '@/hooks/useDecodedParams';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { commitLocalUpdate, useRelayEnvironment } from 'react-relay';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
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
    <a
      href={`/document/get/${slug}/${documentData.id}`}
      onClick={(e) => {
        setDownloadNumber();
        e.stopPropagation();
        setMenuOpen(false);
      }}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className: cn(
            'normal-case h-9 w-full justify-start rounded-none border-none'
          ),
        })
      )}>
      {t('Utils.Download')}
    </a>
  );
};

export default DownloadDocument;
