import { IconActionContext } from '@/components/ui/icon-actions';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FunctionComponent, useContext } from 'react';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
}

export const DownloadDocument: FunctionComponent<DownloadDocumentProps> = ({
  documentData,
}) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const t = useTranslations();
  const serviceId = new URLSearchParams(window.location.search).get('id');

  return (
    <Link
      href={`/document/get/${documentData.id}/${serviceId}`}
      onClick={() => {
          e.stopPropagation();
        setMenuOpen(false);
      }}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          className: cn('h-9 w-full justify-start rounded-none border-none'),
        })
      )}>
      {t('Utils.Download')}
    </Link>
  );
};

export default DownloadDocument;
