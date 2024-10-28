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
import Loader from "@/components/loader";
import {
    vaultAddFileMutation
} from "../../../../__generated__/vaultAddFileMutation.graphql";
import {VaultFileMutation} from "@/components/service/vault/vault.graphql";
import TriggerButton from "@/components/ui/trigger-button";

export const VaultForm = () => {
    const { toast } = useToast();
    const t = useTranslations();
    const [vaultFileMutation] = useMutation<vaultAddFileMutation>(VaultFileMutation);
    const [file, setFile] = useState<File | null>(null)
    const [openSheet, setOpenSheet] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const sendFile=(values: z.infer<typeof newFileSchema>) => {
        setIsLoading(true)
            vaultFileMutation({
                variables: {
                    ...values
                },
                uploadables: values.file as unknown as UploadableMap,
                onCompleted: (response) => {
                    setOpenSheet(false)
                    setFile(null)
                    setIsLoading(false)
                    toast({
                        title: t('Utils.Success'),
                        description: t('Utils.Inserted') + ': ' + response.addVaultFile,
                    });
                },
                onError: (error) => {
                    setIsLoading(false)
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: <>{error.message}</>,
                    });
                },
            });
    }




    return ( <>
        {isLoading && <Loader/>}

            <VaultNewFileFormSheet
                fileExtension={file?.name?.split(".")[1] ?? '.pdf'}
                fileName={file?.name ?? ''}
                open={openSheet}
                trigger={<TriggerButton label="Add new file" />}
                setOpen={setOpenSheet}
                handleSubmit={sendFile}
                />
    </>
    );

}