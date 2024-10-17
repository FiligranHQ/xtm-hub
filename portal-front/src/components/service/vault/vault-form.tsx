'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    useToast,
} from 'filigran-ui/clients';
import * as React from 'react';
import { useState} from 'react';
import {useTranslations} from "next-intl";
import {UploadableMap} from "relay-runtime";
import {useMutation} from "react-relay";
import {vaultFile} from "@/components/service/vault/vault.graphql";
import {FileInput} from "filigran-ui";


export const VaultForm = () => {
    const { toast } = useToast();
    const t = useTranslations();

    const [vaultFileMutation] = useMutation(vaultFile);

    const sendFile=(file: UploadableMap) => {
        vaultFileMutation({
            variables: {
                file: file
            },
            uploadables: file as unknown as UploadableMap,

            onCompleted: () => {
                toast({
                    title: 'Success',
                    description: 'File inserted !',
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
    const [fileName, setFileName] = useState<string | null>(null)

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            setFileName(files[0].name)
            sendFile(files as unknown as UploadableMap)
        }
    }

    return ( <>
            <div className="my-8">
                <FileInput
                    handleFileChange={handleFileChange}
                    texts={{
                        dragUnactive: t('Service.Vault.SelectFile'),
                        fileOk: fileName ?? '',
                    }}
                />
            </div>

    </>
    );

}