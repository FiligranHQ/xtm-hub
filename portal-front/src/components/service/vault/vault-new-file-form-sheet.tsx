import {FunctionComponent} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Form, Sheet, SheetContent} from "filigran-ui/clients";
import {
    FormControl,
    FormField,
    FormItem, FormLabel, FormMessage,
    SheetClose,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "filigran-ui/clients";
import {Button, Input, Textarea} from "filigran-ui/servers";
import {useTranslations} from "next-intl";

export const newFileSchema = z.object({
    shortName: z.string().optional(),
    description: z.string().optional()
})

interface VaultNewFileFormSheetProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    fileExtension: string;
    fileName: string;
    handleSubmit: (
        values: z.infer<typeof newFileSchema>
    ) => void;
}

export const VaultNewFileFormSheet: FunctionComponent<VaultNewFileFormSheetProps> = ({
     open,
     setOpen,
     fileExtension,
     fileName,
     handleSubmit
}) => {
    const t = useTranslations();

    const form = useForm<z.infer<typeof newFileSchema>>({
        resolver: zodResolver(newFileSchema),
        defaultValues: {
            shortName: '',
            description: ''
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

            <SheetContent side={'right'}>
                <SheetHeader className="bg-page-background">
                    <SheetTitle>{t('Service.Vault.FileForm.UploadNewFile')}: {fileName}</SheetTitle>
                </SheetHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-xl">
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
            </SheetContent>
        </Sheet>
    );
}