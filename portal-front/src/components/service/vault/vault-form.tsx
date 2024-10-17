'use client';
import {
    useToast,
} from 'filigran-ui/clients';
import * as React from 'react';
import {useState } from 'react';
import {useTranslations} from "next-intl";
import {UploadableMap} from "relay-runtime";
import {useMutation} from "react-relay";
import {FileInput} from "filigran-ui";
import {newFileSchema, VaultNewFileFormSheet} from "@/components/service/vault/vault-new-file-form-sheet";
import {z} from "zod";
import Loader from "@/components/loader";
import {
    vaultAddFileMutation
} from "../../../../__generated__/vaultAddFileMutation.graphql";
import {
    vaultAddDataFileMutation
} from "../../../../__generated__/vaultAddDataFileMutation.graphql";
import {VaultDataFileMutation, VaultFileMutation} from "@/components/service/vault/vault.graphql";

export const VaultForm = () => {
    const { toast } = useToast();
    const t = useTranslations();
    const [vaultFileMutation] = useMutation<vaultAddFileMutation>(VaultFileMutation);
    const [vaultDataFileMutation] = useMutation<vaultAddDataFileMutation>(VaultDataFileMutation);
    const [file, setFile] = useState(null)
    const [openSheet, setOpenSheet] = useState(false);
    const [fileInputKey, setFileInputKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const addFileData=(values: z.infer<typeof newFileSchema>, minioName: string, fileName: string) => {
        vaultDataFileMutation({
            variables: {
                input: {
                    ...values, fileName: fileName, minioName: minioName
                },
            }, onCompleted: (response) => {
                setOpenSheet(false)
                setFile(null)
                setIsLoading(false)
                toast({
                    title: t('Utils.Success'),
                    description: t('Utils.Inserted'),
                });
                resetFileInput(response.addVaultDataFile.minio_name)
            },
            onError: (error) => {
                setIsLoading(false)
                toast({
                    variant: 'destructive',
                    title: t('Utils.Error'),
                    description: error.message,
                });
            },
        })
    }
    const sendFile=(file: UploadableMap, values: z.infer<typeof newFileSchema>) => {
        setIsLoading(true)
            vaultFileMutation({
                variables: {
                    file: file,
                },
                uploadables: file as unknown as UploadableMap,
                onCompleted: (response) => {
                    addFileData(values, response.addVaultFile, file[0].name)
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

    const handleSubmit = (values: z.infer<typeof newFileSchema>) => {
        file && sendFile(file, values)
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0 && files[0]) {
            setOpenSheet(true)
            setFile(files as unknown as UploadableMap)
        }
    }

    const resetFileInput = (response: string) => {
        setFileInputKey(response);
    };

    return ( <>
        {isLoading && <Loader />}
                <FileInput
                    key={fileInputKey}
                    handleFileChange={handleFileChange}
                    texts={{
                        dragUnactive: t('Service.Vault.FileForm.UploadNewFile'),
                        dragActive: t('Service.Vault.DropFile'),
                        fileOk: file?.name ?? '',
                    }}
                />
            <VaultNewFileFormSheet
                fileExtension={file?.name?.split(".")[1] ?? '.pdf'}
                fileName={file?.name}
                open={openSheet}
                setOpen={setOpenSheet}
                handleSubmit={handleSubmit}
                ></VaultNewFileFormSheet>
    </>
    );

}