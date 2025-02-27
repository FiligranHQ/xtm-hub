'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { DocumentAddMutation } from '@/components/service/document/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileForm,
} from '@/components/service/vault/vault-new-file-form';
import { RESTRICTION } from '@/utils/constant';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useState } from 'react';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import useDecodedParams from '@/hooks/useDecodedParams';
import { documentAddMutation } from '@generated/documentAddMutation.graphql';
import { useMutation } from 'react-relay';
import { UploadableMap } from 'relay-runtime';
import { z } from 'zod';
interface VaultFormProps {
  connectionId: string;
  usersServiceCapabilities: string[];
}
export const VaultForm: React.FunctionComponent<VaultFormProps> = ({
  connectionId,
  usersServiceCapabilities,
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
        serviceInstanceId: slug,
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
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  return (
    <>
      <GuardCapacityComponent
        capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}
        displayError={false}>
        {
          <SheetWithPreventingDialog
            open={openSheet}
            setOpen={setOpenSheet}
            trigger={
              <TriggerButton label={t('Service.Vault.FileForm.AddFile')} />
            }
            title={t('Service.Vault.FileForm.AddFile')}>
            <VaultNewFileForm handleSubmit={sendDocument} />
          </SheetWithPreventingDialog>
        }
      </GuardCapacityComponent>
      {usersServiceCapabilities.some(
        (capa) => capa?.toUpperCase() === ServiceCapabilityName.Upload
      ) && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            <TriggerButton label={t('Service.Vault.FileForm.AddFile')} />
          }
          title={t('Service.Vault.FileForm.AddFile')}>
          <VaultNewFileForm handleSubmit={sendDocument} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
