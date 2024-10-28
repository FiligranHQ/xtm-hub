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
import {Button, Input, Textarea} from "filigran-ui/servers";
import {FileInput} from "filigran-ui";
import {useTranslations} from "next-intl";

export const newFileSchema = z.object({
    shortName: z.string().optional(),
    description: z.string().optional(),
    file: z.custom<FileList>()
})

interface VaultNewFileFormSheetProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    trigger: ReactNode;
    fileExtension: string;
    fileName: string;
    handleSubmit: (
        values: z.infer<typeof newFileSchema>
    ) => void;
}

export const VaultNewFileFormSheet: FunctionComponent<VaultNewFileFormSheetProps> = ({
     open,
     setOpen,
    trigger,
     fileExtension,
     fileName,
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

    const onSubmit = (values: z.infer<typeof newFileSchema>) => {
        handleSubmit({
            ...values,
            shortName: values.shortName && !values.shortName.endsWith(fileExtension)
                ? values.shortName + fileExtension
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
                    <SheetTitle>{t('Service.Vault.FileForm.UploadNewFile')}: {fileName}</SheetTitle>
                </SheetHeader>
                <FileInputDropZone className="absolute inset-0 p-xl pt-[5rem]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-xl">
                        <FormField
                            control={form.control}
                            name="file"
                            render={({field}) => {
                                return (
                                    <FormItem>
                                        <FormLabel>File</FormLabel>
                                        <FormControl>
                                            <FileInput
                                                {...field}
                                                allowedTypes={'image/jpeg, image/gif, image/png, application/pdf, image/svg, video/mp4, video/webm'}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="shortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Service.Vault.FileForm.ShortNameLabel')} ( {fileExtension} auto inserted )</FormLabel>
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
                            <Button
                                type="submit">
                                {t('Utils.Create')}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </FileInputDropZone>
            </SheetContent>
        </Sheet>
    );
}