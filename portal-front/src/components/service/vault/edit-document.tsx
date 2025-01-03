import { DocumentUpdateMutation } from '@/components/service/vault/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileForm,
} from '@/components/service/vault/vault-new-file-form';
import { IconActionContext } from '@/components/ui/icon-actions';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useState } from 'react';

import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
import { documentUpdateMutation } from '../../../../__generated__/documentUpdateMutation.graphql';

interface EditDocumentProps {
  documentData: documentItem_fragment$data;
}

const EditDocument: FunctionComponent<EditDocumentProps> = ({
  documentData,
}) => {
  const [openSheet, setOpenSheet] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();
  const [vaultUpdateDocumentMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );
  const { setMenuOpen } = useContext(IconActionContext);

  const { slug } = useDecodedParams();

  const updateDocumentDescription = (
    values: z.infer<typeof newDocumentSchema>
  ) => {
    vaultUpdateDocumentMutation({
      variables: {
        documentId: values.documentId,
        serviceId: slug,
        newDescription: values.description,
      },
      onCompleted: (response) => {
        setOpenSheet(false);
        setMenuOpen(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: response.editDocument.file_name,
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
      open={openSheet}
      setOpen={setOpenSheet}
      trigger={
        <Button
          onClick={(e) => e.stopPropagation()}
          variant="ghost"
          className="w-full justify-start normal-case"
          aria-label={t('Service.Vault.UpdateDocument')}>
          {t('Utils.Update')}
        </Button>
      }
      title={t('Service.Vault.FileForm.EditFile')}>
      <VaultNewFileForm
        document={documentData}
        handleSubmit={updateDocumentDescription}
      />
    </SheetWithPreventingDialog>
  );
};

export default EditDocument;
