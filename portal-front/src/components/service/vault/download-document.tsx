import { IconActionContext } from '@/components/ui/icon-actions';
import { cn } from '@/lib/utils';
import { buttonVariants } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  const params = useParams<{ slug: string }>();
  const encodedServiceId = params.slug;

  // Have to decode it, otherwise = become %3D for instance
  const serviceId = encodedServiceId
    ? decodeURIComponent(encodedServiceId)
    : null;
  return (
    <Link
      href={`/document/get/${serviceId}/${documentData.id}`}
      onClick={(e) => {
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
    </Link>
  );
};

export default DownloadDocument;
