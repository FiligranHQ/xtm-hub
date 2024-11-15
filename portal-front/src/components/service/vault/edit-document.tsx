import { DocumentUpdateMutation } from '@/components/service/vault/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileFormSheet,
} from '@/components/service/vault/vault-new-file-form-sheet';
import { IconActionContext } from '@/components/ui/icon-actions';
import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';
import { documentUpdateMutation } from '../../../../__generated__/documentUpdateMutation.graphql';

interface EditDocumentProps {
  documentData: documentItem_fragment$data;
}

export const EditDocument: FunctionComponent<EditDocumentProps> = ({
  documentData,
}) => {
  const [openSheet, setOpenSheet] = useState(false);
  const { toast } = useToast();
  const t = useTranslations();
  const [vaultUpdateDocumentMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );
  const { setMenuOpen } = useContext(IconActionContext);
  const updateDocumentDescription = (
    values: z.infer<typeof newDocumentSchema>
  ) => {
    vaultUpdateDocumentMutation({
      variables: {
        documentId: values.documentId,
        newDescription: values.description,
      },
      onCompleted: (response) => {
        setOpenSheet(false);
        setMenuOpen(false);
        toast({
          title: t('Utils.Success'),
          description:
            response.editDocument.file_name + ' ' + t('Utils.Modified'),
        });
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
    <div onClick={(e) => e.stopPropagation()}>
      <VaultNewFileFormSheet
        open={openSheet}
        setOpen={setOpenSheet}
        document={documentData}
        trigger={
          <Button
            onClick={(e) => e.stopPropagation()}
            variant="ghost"
            className="w-full justify-start"
            aria-label="Update document">
            {t('Utils.Update')}
          </Button>
        }
        handleSubmit={updateDocumentDescription}
      />
    </div>
  );
};

export default EditDocument;
