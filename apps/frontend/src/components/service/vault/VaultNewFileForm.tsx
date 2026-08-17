import { DocumentExistsQuery } from '@/components/service/document/document.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { useDialogContext } from '@/components/ui/SheetWithPreventingDialog';
import useDecodedParams from '@/hooks/use-decoded-params';
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
} from '@filigran/ui';
import { documentExistsQuery } from '@generated/documentExistsQuery.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useLazyLoadQuery } from 'react-relay';
import { z } from 'zod';

import { useTranslate } from '@tolgee/react';
export const newDocumentSchema = z.object({
  description: z.string().optional(),
  documentId: z.string().optional(),
  document: z.custom<FileList>(),
});

interface VaultNewFileFormSheetProps {
  document?: documentItem_fragment$data;
  handleSubmit: (values: z.infer<typeof newDocumentSchema>) => void;
}

export const VaultNewFileForm = ({
  document,
  handleSubmit,
}: VaultNewFileFormSheetProps) => {
  const { t } = useTranslate();
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

  const watchDocument = useWatch({
    control: form.control,
    name: 'document',
  });

  const documentName = watchDocument?.[0]?.name || null;

  const { documentExists } = useLazyLoadQuery<documentExistsQuery>(
    DocumentExistsQuery,
    { documentName, serviceInstanceId: slug },
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
                    <FormLabel>{t('Service_Vault_FileForm_File')}</FormLabel>
                    <FormControl>
                      <FileInput
                        {...field}
                        texts={{
                          selectFile: t(
                            'Service_Vault_FileForm_SelectDocument'
                          ),
                          noFile: t('Service_Vault_FileForm_NoDocument'),
                          dropFiles: t('Service_Vault_FileForm_DropDocuments'),
                        }}
                        allowedTypes={
                          'image/jpeg, image/gif, image/png, application/pdf, image/svg, video/mp4, video/webm, .docx, .docw,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {documentExists && (
                      <FormMessage>
                        <div>{t('Service_Vault_FileForm_AlreadyExists')}</div>
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
                  {t('Service_Vault_FileForm_DescriptionLabel')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'Service_Vault_FileForm_DescriptionPlaceholder'
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
              variant="secondary"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils_Cancel')}
            </Button>

            {documentExists ? (
              <AlertDialogComponent
                AlertTitle={t('Service_Vault_FileForm_FileAlreadyExists')}
                actionButtonText={t('Utils_Continue')}
                triggerElement={
                  <Button type="button">{t('Utils_Validate')}</Button>
                }
                onClickContinue={form.handleSubmit(onSubmit)}>
                {t('Service_Vault_FileForm_FileExistsDialog')}
              </AlertDialogComponent>
            ) : (
              <Button
                type="submit"
                disabled={!form.formState.isValid}>
                {t('Utils_Validate')}
              </Button>
            )}
          </SheetFooter>
        </form>
      </Form>
    </FileInputDropZone>
  );
};
