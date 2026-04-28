import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import useDecodedParams from '../../../hooks/use-decoded-params';
import { IconActionContext, IconActionsItem } from '../../ui/IconActions';
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
