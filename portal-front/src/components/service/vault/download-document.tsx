import { IconActionContext } from '@/components/ui/icon-actions';
import useDecodedParams from '@/hooks/useDecodedParams';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
  downloadClicked: (documentId: string) => void;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
  documentData,
  downloadClicked,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const t = useTranslations();
  const { slug } = useDecodedParams();
  return (
    <a
      href={`/document/get/${slug}/${documentData.id}`}
      onClick={(e) => {
        downloadClicked(documentData.id);
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
