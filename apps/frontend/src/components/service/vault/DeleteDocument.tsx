import { DocumentDeleteMutation } from '@/components/service/document/document.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { IconActionContext } from '@/components/ui/IconActions';
import useDecodedParams from '@/hooks/use-decoded-params';
import { useToast } from '@filigran/ui';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useContext } from 'react';
import { useMutation } from 'react-relay';

import { useTranslate } from '@tolgee/react';
interface DeleteDocumentProps {
  documentData: documentItem_fragment$data;
  connectionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const DeleteDocument = ({
  documentData,
  connectionId,
  open,
  setOpen,
}: DeleteDocumentProps) => {
  const { t } = useTranslate();
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
        serviceInstanceId: slug,
        connections: [connectionId],
      },
      onCompleted: () => {
        toast({
          title: t('Utils_Success'),
          description: t('VaultActions_DocumentDeleted', {
            file_name: documentData.file_name ?? '',
          }),
        });
        setMenuOpen(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: t(`Error_Server_${error.message}`),
        });
      },
    });
  };

  return (
    <AlertDialogComponent
      AlertTitle={t('Utils_Delete')}
      actionButtonText={t('Utils_Delete')}
      variantName={'destructive'}
      isOpen={open}
      onOpenChange={setOpen}
      onClickContinue={deleteDocument}>
      {t('Service_Vault_FileForm_DeleteDialog')}
    </AlertDialogComponent>
  );
};

export default DeleteDocument;
