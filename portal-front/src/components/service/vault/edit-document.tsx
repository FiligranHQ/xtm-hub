import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import {newDocumentSchema, VaultNewFileFormSheet} from "@/components/service/vault/vault-new-file-form-sheet";
import {DocumentUpdateMutation} from "@/components/service/vault/document.graphql";
import {useTranslations} from "next-intl";
import {documentUpdateMutation} from "../../../../__generated__/documentUpdateMutation.graphql";
import {documentsList$data} from "../../../../__generated__/documentsList.graphql";

interface EditDocumentProps {
    documentData: documentsList$data;
}

export const EditDocument: FunctionComponent<EditDocumentProps> = ({
               documentData
       }) => {
    const [openSheet, setOpenSheet] = useState(false);
    const { toast } = useToast();
    const t = useTranslations();
    const [vaultUpdateDocumentMutation] = useMutation<documentUpdateMutation>(DocumentUpdateMutation);
    const updateDocumentDescription=(values: z.infer<typeof newDocumentSchema>) => {
        vaultUpdateDocumentMutation({
            variables: {
                documentId: values.documentId,
                newDescription: values.description
            },
            onCompleted: (response) => {
                setOpenSheet(false)
                toast({
                    title: t('Utils.Success'),
                    description: response.editDocument.file_name + ' ' + t('Utils.Modified'),
                });
            },
            onError: (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: <>{error.message}</>,
                });
            },
        })
    }
    return (
        <VaultNewFileFormSheet open={openSheet}
                               setOpen={setOpenSheet}
                               document={documentData}
                               trigger={
                                   <Button
                                       variant="ghost"
                                       className="w-full justify-start"
                                       aria-label="Update document">
                                       {t('Utils.Edit')}
                                   </Button>
                               }
                               title={"Edit the documents's description"}
                               handleSubmit={updateDocumentDescription}/>
    )
}

export default EditDocument;