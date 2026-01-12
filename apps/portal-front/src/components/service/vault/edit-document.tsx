import { DocumentUpdateMutation } from '@/components/service/document/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileForm,
} from '@/components/service/vault/vault-new-file-form';
import { IconActionContext } from '@/components/ui/icon-actions';
import { useToast } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';

import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import DocumentItem_fragmentGraphql, {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { readInlineData, useMutation } from 'react-relay';
import { z } from 'zod';

interface EditDocumentProps {
  documentData: documentItem_fragment$data;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditDocument: FunctionComponent<EditDocumentProps> = ({
  documentData,
  open,
  setOpen,
}) => {
  const { toast } = useToast();
  const t = useTranslations();
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
        document: [],
        updateDocument: false,
        images: [],
      },
      onCompleted: (response) => {
        setOpen(false);
        setMenuOpen(false);
        const updatedDocument = readInlineData<documentItem_fragment$key>(
          DocumentItem_fragmentGraphql,
          response.updateDocument
        );
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: updatedDocument.file_name ?? '',
          }),
        });
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
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('Service.Vault.FileForm.EditFile')}>
      <VaultNewFileForm
        document={documentData}
        handleSubmit={updateDocumentDescription}
      />
    </SheetWithPreventingDialog>
  );
};

export default EditDocument;
