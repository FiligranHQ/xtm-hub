import {
  IconActionContext,
  IconActionsItem,
} from '@/components/ui/IconActions';
import useDecodedParams from '@/hooks/use-decoded-params';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
interface DownloadDocumentProps {
  documentData: documentItem_fragment$data;
}

export const VisualizeDocument = ({ documentData }: DownloadDocumentProps) => {
  const { setMenuOpen } = useContext(IconActionContext);
  const t = useTranslations();
  const { slug } = useDecodedParams();
  return (
    <IconActionsItem asChild>
      <a
        href={`/document/visualize/${slug}/${documentData.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          setMenuOpen(false);
        }}>
        {t('Utils.Visualize')}
      </a>
    </IconActionsItem>
  );
};

export default VisualizeDocument;
