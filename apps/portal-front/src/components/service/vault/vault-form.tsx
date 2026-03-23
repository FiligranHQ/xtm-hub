'use client';
import { DocumentCreateMutation } from '@/components/service/document/document.graphql';
import {
  newDocumentSchema,
  VaultNewFileForm,
} from '@/components/service/vault/vault-new-file-form';
import { Button, useToast } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext, useState } from 'react';

import { PortalContext } from '@/components/me/app-portal-context';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import { splitFileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { documentCreateMutation } from '@generated/documentCreateMutation.graphql';
import DocumentItem_fragmentGraphql, {
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { readInlineData, useMutation } from 'react-relay';
import slugify from 'slugify';
import { z } from 'zod';
interface VaultFormProps {
  connectionId: string;
  userCanUpdate: boolean;
}
export const VaultForm: React.FunctionComponent<VaultFormProps> = ({
  connectionId,
  userCanUpdate,
}) => {
  const { toast } = useToast();
  const t = useTranslations();
  const [createMutation] = useMutation<documentCreateMutation>(
    DocumentCreateMutation
  );
  const [openSheet, setOpenSheet] = useState(false);
  const { me } = useContext(PortalContext);

  const { slug } = useDecodedParams();
  if (!slug) {
    return null;
  }

  const createDocument = (values: z.infer<typeof newDocumentSchema>) => {
    if (!values.document[0]) {
      return;
    }

    const key = `${values.document[0].name}:${me?.id}`;
    createMutation({
      variables: {
        input: {
          name: key,
          slug: slugify(key),
          short_description: 'Vault Document Default Short Description',
          description: values.description ?? 'Vault Document Description',
          active: true,
          uploader_id: me?.id ?? '',
        },
        metadata: [],
        serviceInstanceId: slug,
        connections: connectionId ? [connectionId] : [],
        sourceDocument: [values.document],
      },
      uploadables: splitFileListToUploadableMap({
        sourceDocument: values.document,
      }),
      onCompleted: (response) => {
        setOpenSheet(false);
        const createdDocument = readInlineData<documentItem_fragment$key>(
          DocumentItem_fragmentGraphql,
          response.createDocument
        );
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentAdded', {
            file_name: createdDocument.file_name ?? '',
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
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={<Button>{t('Service.Vault.FileForm.AddFile')}</Button>}
          title={t('Service.Vault.FileForm.AddFile')}>
          <VaultNewFileForm handleSubmit={createDocument} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
