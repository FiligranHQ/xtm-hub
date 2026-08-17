import { DocumentUpdateMutation } from '@/components/service/document/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileForm,
} from '@/components/service/vault/VaultNewFileForm';
import { IconActionContext } from '@/components/ui/IconActions';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import useDecodedParams from '@/hooks/use-decoded-params';
import { useToast } from '@filigran/ui';
import DocumentItem_fragmentGraphql, {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { useContext } from 'react';
import { readInlineData, useMutation } from 'react-relay';
import { z } from 'zod';

import { useTranslate } from '@tolgee/react';
interface EditDocumentProps {
  documentData: documentItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditDocument = ({
  documentData,
  open,
  setOpen,
}: EditDocumentProps) => {
  const { toast } = useToast();
  const { t } = useTranslate();
  const [updateMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );
  const { setMenuOpen } = useContext(IconActionContext);
  const { slug } = useDecodedParams();
  if (!slug) {
    return null;
  }

  const updateDocumentDescription = (
    values: z.infer<typeof newDocumentSchema>
  ) => {
    if (!values.documentId) {
      return;
    }

    updateMutation({
      variables: {
        documentId: values.documentId,
        serviceInstanceId: slug,
        input: {
          description: values.description,
        },
        metadata: [],
        existingImageIds: [],
      },
      onCompleted: (response) => {
        setOpen(false);
        setMenuOpen(false);
        const updatedDocument = readInlineData<documentItem_fragment$key>(
          DocumentItem_fragmentGraphql,
          response.updateDocument
        );
        toast({
          title: t('Utils_Success'),
          description: t('VaultActions_DocumentUpdated', {
            file_name: updatedDocument.file_name ?? '',
          }),
        });
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
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('Service_Vault_FileForm_EditFile')}>
      <VaultNewFileForm
        document={documentData}
        handleSubmit={updateDocumentDescription}
      />
    </SheetWithPreventingDialog>
  );
};

export default EditDocument;
