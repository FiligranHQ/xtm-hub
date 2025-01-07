'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { DocumentAddMutation } from '@/components/service/vault/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileFormSheet,
} from '@/components/service/vault/vault-new-file-form-sheet';
import { RESTRICTION } from '@/utils/constant';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';

import TriggerButton from '@/components/ui/trigger-button';
import useDecodedParams from '@/hooks/useDecodedParams';
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

  const { slug } = useDecodedParams();
  const sendDocument = (values: z.infer<typeof newDocumentSchema>) => {
    vaultDocumentMutation({
      variables: {
        ...values,
        serviceId: slug,
        connections: [connectionId],
      },
      uploadables: values.document as unknown as UploadableMap,
      onCompleted: (response) => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentAdded', {
            file_name: response.addDocument.file_name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{error.message}</>,
        });
      },
    });
  };

  return (
    <>
      <GuardCapacityComponent
        capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
        displayError={false}>
        <VaultNewFileFormSheet
          open={openSheet}
          trigger={
            <TriggerButton label={t('Service.Vault.FileForm.AddFile')} />
          }
          setOpen={setOpenSheet}
          handleSubmit={sendDocument}
        />
      </GuardCapacityComponent>
    </>
  );
};
