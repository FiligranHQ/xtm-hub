import { DocumentExistsQuery } from '@/components/service/vault/document.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import useDecodedParams from '@/hooks/useDecodedParams';
import { zodResolver } from '@hookform/resolvers/zod';

import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import {
  Button,
  FileInput,
  FileInputDropZone,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SheetFooter,
  Textarea,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
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
  document?: documentItem_fragment$data;
  handleSubmit: (values: z.infer<typeof newDocumentSchema>) => void;
}

export const VaultNewFileForm: FunctionComponent<
  VaultNewFileFormSheetProps
> = ({ document, handleSubmit }) => {
  const t = useTranslations();
  const { handleCloseSheet, setIsDirty } = useDialogContext();
  const form = useForm<z.infer<typeof newDocumentSchema>>({
    resolver: zodResolver(newDocumentSchema),
    defaultValues: {
      description: document?.description ?? '',
      documentId: document?.id ?? '',
      document: undefined,
    },
  });
  setIsDirty(form.formState.isDirty);
  if (form.getValues('document')) {
    setIsDirty(true);
  }

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
                    <FormLabel>{t('Service.Vault.FileForm.File')}</FormLabel>
                    <FormControl>
                      <FileInput
                        {...field}
                        texts={{
                          selectFile: t(
                            'Service.Vault.FileForm.SelectDocument'
                          ),
                          noFile: t('Service.Vault.FileForm.NoDocument'),
                          dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                        }}
                        allowedTypes={
                          'image/jpeg, image/gif, image/png, application/pdf, image/svg, video/mp4, video/webm, .docx, .docw,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {documentExists && (
                      <FormMessage>
                        <div>{t('Service.Vault.FileForm.AlreadyExists')}</div>
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
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>

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
  );
};
