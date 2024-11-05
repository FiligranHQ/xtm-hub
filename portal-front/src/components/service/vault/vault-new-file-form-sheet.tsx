import {FunctionComponent, ReactNode} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";

import {z} from "zod";
import {Form, Sheet, SheetContent,FileInputDropZone} from "filigran-ui/clients";
import {
    FormControl,
    FormField,
    FormItem, FormLabel, FormMessage,
    SheetClose,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "filigran-ui/clients";
import {Button, Textarea} from "filigran-ui/servers";
import {FileInput} from "filigran-ui";
import {useTranslations} from "next-intl";
import { useLazyLoadQuery } from 'react-relay';
import {fileExistsQuery} from "../../../../__generated__/fileExistsQuery.graphql";
import {FileExistsQuery} from "@/components/service/vault/file.graphql";
import {AlertDialogComponent} from "@/components/ui/alert-dialog";
import {fileList$data} from "../../../../__generated__/fileList.graphql";

export const newFileSchema = z.object({
    description: z.string().optional(),
    documentId: z.string().optional(),
    file: z.custom<FileList>()
})

interface VaultNewFileFormSheetProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    trigger: ReactNode;
    document?: fileList$data;
    handleSubmit: (
        values: z.infer<typeof newFileSchema>
    ) => void;
}

export const VaultNewFileFormSheet: FunctionComponent<VaultNewFileFormSheetProps> = ({
     open,
     setOpen,
    trigger,
    document,
     handleSubmit
}) => {
    const t = useTranslations();

    const form = useForm<z.infer<typeof newFileSchema>>({
        resolver: zodResolver(newFileSchema),
        defaultValues: {
            description: document ? document.description : '',
            documentId: document ? document.id : '',
            file: undefined
        }
    })
    const { watch } = form;
    const watchFile = watch('file');

    const fileName = watchFile?.[0]?.name || null;

    const {fileExists} = useLazyLoadQuery<fileExistsQuery>(
        FileExistsQuery,
        { fileName }
    );

    const onSubmit = (values: z.infer<typeof newFileSchema>) => {
        handleSubmit({
            ...values
        });
        form.reset();
    };

    return (
        <Sheet key={'right'}
    open={open}
    onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent side={'right'}>
                <SheetHeader className="bg-page-background">
                    {document ? <SheetTitle>{t('Service.Vault.FileForm.EditFile')} </SheetTitle> : <SheetTitle>{t('Service.Vault.FileForm.UploadNewFile')} </SheetTitle> }
                </SheetHeader>
                <FileInputDropZone className="absolute inset-0 p-xl pt-[5rem]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-xl">
                        {!document && <FormField
                            control={form.control}
                            name="file"
                            render={({field}) => {
                                return (
                                    <FormItem>
                                        <FormLabel>{t('Service.Vault.FileForm.File')}</FormLabel>
                                        <FormControl>
                                            <FileInput
                                                {...field}
                                                allowedTypes={'image/jpeg, image/gif, image/png, application/pdf, image/svg, video/mp4, video/webm'}

                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {fileExists && (
                                            <FormMessage>
                                                <div>{t('Service.Vault.FileForm.AlreadyExists')}</div>
                                            </FormMessage>
                                        )}
                                    </FormItem>
                                );
                            }}
                        />}

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Service.Vault.FileForm.DescriptionLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('Service.Vault.FileForm.DescriptionPlaceholder')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <SheetFooter className="pt-2">
                            <SheetClose asChild>
                                <Button variant="outline">{t('Utils.Cancel')}</Button>
                            </SheetClose>

                            {fileExists ? (<AlertDialogComponent
                                AlertTitle={t('Service.Vault.FileForm.FileAlreadyExists')}
                                actionButtonText={t('Utils.Continue')}
                                triggerElement={
                                    <Button
                                        type="button"
                                    >
                                        {t('Utils.Validate')}
                                    </Button>
                                }
                                onClickContinue={form.handleSubmit(onSubmit)}>
                                {t('Service.Vault.FileForm.FileExistsDialog')}
                            </AlertDialogComponent>) : (   <Button
                               type="submit">
                                {t('Utils.Validate')}
                            </Button>)}

                        </SheetFooter>

                    </form>
                </Form>
            </FileInputDropZone>
            </SheetContent>
        </Sheet>
    );
}