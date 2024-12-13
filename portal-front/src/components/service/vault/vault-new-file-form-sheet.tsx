import { DocumentExistsQuery } from '@/components/service/vault/document.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import { zodResolver } from '@hookform/resolvers/zod';

import { FileInput } from 'filigran-ui';
import {
  FileInputDropZone,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'filigran-ui/clients';
import { Button, Textarea } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { FunctionComponent, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useLazyLoadQuery } from 'react-relay';
import { z } from 'zod';
import { documentExistsQuery } from '../../../../__generated__/documentExistsQuery.graphql';
import { documentItem_fragment$data } from '../../../../__generated__/documentItem_fragment.graphql';

export const newDocumentSchema = z.object({
  description: z.string().optional(),
  documentId: z.string().optional(),
  document: z.custom<FileList>(),
});

interface VaultNewFileFormSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  document?: documentItem_fragment$data;
  handleSubmit: (values: z.infer<typeof newDocumentSchema>) => void;
}

export const VaultNewFileFormSheet: FunctionComponent<
  VaultNewFileFormSheetProps
> = ({ open, setOpen, trigger, document, handleSubmit }) => {
  const t = useTranslations();
  const form = useForm<z.infer<typeof newDocumentSchema>>({
    resolver: zodResolver(newDocumentSchema),
    defaultValues: {
      description: document?.description ?? '',
      documentId: document?.id ?? '',
      document: undefined,
    },
  });

  const { slug } = useDecodedParams();

  const { watch } = form;
  const watchDocument = watch('document');

  const documentName = watchDocument?.[0]?.name || null;

  const { documentExists } = useLazyLoadQuery<documentExistsQuery>(
    DocumentExistsQuery,
    { documentName, serviceId: slug },
    { fetchPolicy: 'store-and-network' }
  );

  const onSubmit = (values: z.infer<typeof newDocumentSchema>) => {
    handleSubmit({
      ...values,
    });
    form.reset();
  };

  return (
    <Sheet
      key={'right'}
      open={open}
      onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side={'right'}
        onClick={(e) => e.stopPropagation()}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>
            {document
              ? t('Service.Vault.FileForm.EditFile')
              : t('Service.Vault.FileForm.UploadNewFile')}
          </SheetTitle>
        </SheetHeader>
        <FileInputDropZone className="absolute inset-0 p-xl pt-[5rem]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-xl">
              {!document && (
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>
                          {t('Service.Vault.FileForm.File')}
                        </FormLabel>
                        <FormControl>
                          <FileInput
                            {...field}
                            texts={{
                              selectFile: t(
                                'Service.Vault.FileForm.SelectDocument'
                              ),
                              noFile: t('Service.Vault.FileForm.NoDocument'),
                              dropFiles: t(
                                'Service.Vault.FileForm.DropDocuments'
                              ),
                            }}
                            allowedTypes={
                              'image/jpeg, image/gif, image/png, application/pdf, image/svg, video/mp4, video/webm, .docx, .docw,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        {documentExists && (
                          <FormMessage>
                            <div>
                              {t('Service.Vault.FileForm.AlreadyExists')}
                            </div>
                          </FormMessage>
                        )}
                      </FormItem>
                    );
                  }}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('Service.Vault.FileForm.DescriptionLabel')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Service.Vault.FileForm.DescriptionPlaceholder'
                        )}
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

                {documentExists ? (
                  <AlertDialogComponent
                    AlertTitle={t('Service.Vault.FileForm.FileAlreadyExists')}
                    actionButtonText={t('Utils.Continue')}
                    triggerElement={
                      <Button type="button">{t('Utils.Validate')}</Button>
                    }
                    onClickContinue={form.handleSubmit(onSubmit)}>
                    {t('Service.Vault.FileForm.FileExistsDialog')}
                  </AlertDialogComponent>
                ) : (
                  <Button type="submit">{t('Utils.Validate')}</Button>
                )}
              </SheetFooter>
            </form>
          </Form>
        </FileInputDropZone>
      </SheetContent>
    </Sheet>
  );
};
