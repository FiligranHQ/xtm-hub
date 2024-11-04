'use client';
import {
    useToast,
} from 'filigran-ui/clients';
import * as React from 'react';
import {useState } from 'react';
import {useTranslations} from "next-intl";
import {UploadableMap} from "relay-runtime";
import {useMutation} from "react-relay";
import {newFileSchema, VaultNewFileFormSheet} from "@/components/service/vault/vault-new-file-form-sheet";
import {z} from "zod";
import {
    fileAddMutation
} from "../../../../__generated__/fileAddMutation.graphql";
import {FileAddMutation} from "@/components/service/vault/file.graphql";
import TriggerButton from "@/components/ui/trigger-button";

export const VaultForm = () => {
    const { toast } = useToast();
    const t = useTranslations();
    const [vaultFileMutation] = useMutation<fileAddMutation>(FileAddMutation);
    const [openSheet, setOpenSheet] = useState(false);

    const sendFile=(values: z.infer<typeof newFileSchema>) => {
            vaultFileMutation({
                variables: {
                    ...values
                },
                uploadables: values.file as unknown as UploadableMap,
                onCompleted: (response) => {
                    setOpenSheet(false)
                    toast({
                        title: t('Utils.Success'),
                        description: response.addFile + ' ' + t('Utils.Inserted'),
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
    }

    return ( <>
            <VaultNewFileFormSheet
                open={openSheet}
                trigger={<TriggerButton label={t('Service.Vault.FileForm.AddFile')} />}
                setOpen={setOpenSheet}
                handleSubmit={sendFile}
                />
    </>
    );

}