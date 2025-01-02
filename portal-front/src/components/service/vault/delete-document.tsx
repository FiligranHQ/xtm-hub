import { DocumentDeleteMutation } from '@/components/service/vault/document.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { useMutation } from 'react-relay';

import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
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
  const { slug } = useDecodedParams();

  const deleteDocument = () => {
    vaultDeleteDocumentMutation({
      variables: {
        documentId: documentData.id,
        serviceId: slug,
        connections: [connectionId],
      },
      onCompleted: (response) => {
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentDeleted', {
            file_name: response.deleteDocument.file_name,
          }),
        });
        setMenuOpen(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  return (
    <AlertDialogComponent
      AlertTitle={t('Utils.Delete')}
      actionButtonText={t('Utils.Delete')}
      variantName={'destructive'}
      triggerElement={
        <Button
          variant="ghost"
          className="w-full justify-start normal-case"
          aria-label={t('Service.Vault.DeleteDocument')}>
          {t('Utils.Delete')}
        </Button>
      }
      onClickContinue={deleteDocument}>
      {t('Service.Vault.FileForm.DeleteDialog')}
    </AlertDialogComponent>
  );
};

export default DeleteDocument;
