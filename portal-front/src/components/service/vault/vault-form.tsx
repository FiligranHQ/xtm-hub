'use client';
import { DocumentAddMutation } from '@/components/service/vault/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileFormSheet,
} from '@/components/service/vault/vault-new-file-form-sheet';
import TriggerButton from '@/components/ui/trigger-button';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { UploadableMap } from 'relay-runtime';
import { z } from 'zod';
import { documentAddMutation } from '../../../../__generated__/documentAddMutation.graphql';
interface VaultFormProps {
  connectionId: string;
}
export const VaultForm: React.FunctionComponent<VaultFormProps> = ({
  connectionId,
}) => {
  const { toast } = useToast();
  const t = useTranslations();
  const [vaultDocumentMutation] =
    useMutation<documentAddMutation>(DocumentAddMutation);
  const [openSheet, setOpenSheet] = useState(false);
  const serviceId = new URLSearchParams(window.location.search).get('id');

  const sendDocument = (values: z.infer<typeof newDocumentSchema>) => {
    vaultDocumentMutation({
      variables: {
        ...values,
        serviceId: serviceId,
        connections: [connectionId],
      },
      uploadables: values.document as unknown as UploadableMap,
      onCompleted: (response) => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description:
            response.addDocument.file_name + ' ' + t('Utils.Inserted'),
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
    <>
      <VaultNewFileFormSheet
        open={openSheet}
        trigger={<TriggerButton label={t('Service.Vault.FileForm.AddFile')} />}
        setOpen={setOpenSheet}
        handleSubmit={sendDocument}
      />
    </>
  );
};
