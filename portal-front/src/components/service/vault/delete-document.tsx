import { DocumentDeleteMutation } from '@/components/service/vault/document.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { FunctionComponent, useContext } from 'react';
import { useMutation } from 'react-relay';
import { documentDeleteMutation } from '../../../../__generated__/documentDeleteMutation.graphql';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
interface DeleteDocumentProps {
  documentData: documentItem_fragment$data;
  connectionId: string;
}

export const DeleteDocument: FunctionComponent<DeleteDocumentProps> = ({
  documentData,
  connectionId,
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const { setMenuOpen } = useContext(IconActionContext);

  const [vaultDeleteDocumentMutation] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );

  const deleteDocument = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    vaultDeleteDocumentMutation({
      variables: {
        documentId: documentData.id,
        connections: [connectionId],
      },
      onCompleted: (response) => {
        console.log('response', response);
        toast({
          title: 'Success',
          description:
            response.deleteDocument.file_name + ' ' + t('Utils.Deleted'),
        });
        setMenuOpen(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      aria-label="Download Document"
      onClick={deleteDocument}>
      {t('Utils.Delete')}
    </Button>
  );
};

export default DeleteDocument;
