import { IconActionContext } from '@/components/ui/icon-actions';
import useDecodedParams from '@/hooks/useDecodedParams';
import { cn } from '@/lib/utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { buttonVariants } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
}

export const VisualizeDocument: FunctionComponent<DownloadDocumentProps> = ({
  documentData,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const t = useTranslations();
  const { slug } = useDecodedParams();
  return (
    <a
      href={`/document/visualize/${slug}/${documentData.id}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
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
      {t('Utils.Visualize')}
    </a>
  );
};

export default VisualizeDocument;
