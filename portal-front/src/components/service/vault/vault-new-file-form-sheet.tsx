import {FunctionComponent, ReactNode, useEffect, useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import { useRef } from 'react';

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
import {Button, Input, Textarea} from "filigran-ui/servers";
import {FileInput} from "filigran-ui";
import {useTranslations} from "next-intl";
import { useLazyLoadQuery } from 'react-relay';
import {fileExistsQuery} from "../../../../__generated__/fileExistsQuery.graphql";
import {FileExistsQuery} from "@/components/service/vault/file.graphql";
import {AlertDialogComponent} from "@/components/ui/alert-dialog";

export const newFileSchema = z.object({
    shortName: z.string().optional(),
    description: z.string().optional(),
    file: z.custom<FileList>()
})

interface VaultNewFileFormSheetProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    trigger: ReactNode;
    handleSubmit: (
        values: z.infer<typeof newFileSchema>
    ) => void;
}

export const VaultNewFileFormSheet: FunctionComponent<VaultNewFileFormSheetProps> = ({
     open,
     setOpen,
    trigger,
     handleSubmit
}) => {
    const t = useTranslations();


    const form = useForm<z.infer<typeof newFileSchema>>({
        resolver: zodResolver(newFileSchema),
        defaultValues: {
            shortName: '',
            description: '',
            file: undefined
        }
    })
    const { watch } = form;
    const file = watch('file');
    const [fileName, setFileName] = useState(null);
    const [fileExists, setFileExists] = useState<boolean>(false);

    useEffect(() => {
        if (file && file.length > 0) {
            setFileName(file[0].name);
        }
    }, [file]);

    const fileExistsData = useLazyLoadQuery<fileExistsQuery>(
        FileExistsQuery,
        { fileName }
    );

    useEffect(() => {
        if (fileExistsData) {
            setFileExists(fileExistsData.fileExists);
        }
    }, [fileExistsData]);

    const formRef = useRef<HTMLFormElement>(null);
    const handleContinuePopUp = () => {
        form.handleSubmit(onSubmit)();
    };
    const onSubmit = (values: z.infer<typeof newFileSchema>) => {
        const extension = values?.file[0]?.name.split('.')[1]
        handleSubmit({
            ...values,
            shortName: values.shortName && !values.shortName.endsWith(extension ?? '')
                ? values.shortName + '.' + extension
                : values.shortName,
        });
    };

    return (
        <Sheet key={'right'}
    open={open}
    onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent side={'right'}>
                <SheetHeader className="bg-page-background">
                    <SheetTitle>{t('Service.Vault.FileForm.UploadNewFile')}</SheetTitle>
                </SheetHeader>
                <FileInputDropZone className="absolute inset-0 p-xl pt-[5rem]">
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-xl">
                        <FormField
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
                        />
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Service.Vault.FileForm.ShortNameLabel')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('Service.Vault.FileForm.ShortNamePlaceholder')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        TODO Later : choose the Vault Partner here

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
                                        {t('Utils.Create')}
                                    </Button>
                                }
                                onClickContinue={() =>
                                    handleContinuePopUp()}

                                    >
                                {t('Service.Vault.FileForm.FileExistsDialog')}
                            </AlertDialogComponent>) : (   <Button
                               type="submit">
                                {t('Utils.Create')}
                            </Button>)}

                        </SheetFooter>

                    </form>
                </Form>
            </FileInputDropZone>


            </SheetContent>

        </Sheet>
    );
}