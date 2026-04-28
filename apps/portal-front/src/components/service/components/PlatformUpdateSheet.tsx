'use client';

import { translateServiceDefinitionIdentifier } from '@/components/registration/platform-identifier-mapping';
import { UpdatePlatformServiceMetadata } from '@/components/service/service.graphql';
import {
  Button,
  FileInput,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  SheetFooter,
  useToast,
} from '@filigran/ui';
import { ServiceDefinitionIdentifier } from '@generated/serviceInstance_fragment.graphql';
import { serviceUpdatePlatformServiceMetadataMutation } from '@generated/serviceUpdatePlatformServiceMetadataMutation.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { fileListToUploadableMap } from '../../../relay/environment/fetch-form-data';
import { SheetWithPreventingDialog } from '../../ui/SheetWithPreventingDialog';

const platformUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  illustration_document: z.custom<FileList>().optional(),
});

interface PlatformUpdateSheetProps {
  serviceInstanceId: string;
  serviceInstanceName: string;
  serviceDefinitionIdentifier: ServiceDefinitionIdentifier;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const PlatformUpdateSheet: FunctionComponent<
  PlatformUpdateSheetProps
> = ({
  serviceInstanceId,
  serviceInstanceName,
  serviceDefinitionIdentifier,
  open,
  setOpen,
}) => {
  const t = useTranslations();
  const { toast } = useToast();

  const [updatePlatformMetadata] =
    useMutation<serviceUpdatePlatformServiceMetadataMutation>(
      UpdatePlatformServiceMetadata
    );

  const form = useForm<z.infer<typeof platformUpdateSchema>>({
    resolver: zodResolver(platformUpdateSchema),
    defaultValues: {
      name: serviceInstanceName,
      illustration_document: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof platformUpdateSchema>) => {
    const document = !values.illustration_document
      ? null
      : Array.from(values.illustration_document);
    const uploadables = !document
      ? undefined
      : fileListToUploadableMap(document);

    updatePlatformMetadata({
      variables: {
        input: {
          serviceInstanceId: serviceInstanceId,
          name: values.name,
        },
        document,
      },
      uploadables,
      onCompleted: () => {
        setOpen(false);
        toast({
          title: t('Utils.Success'),
          description: t('Platform.Updated', {
            platformName: values.name,
          }),
        });
        form.reset({
          name: values.name,
          illustration_document: undefined,
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  // Get platform name for display
  const getPlatformName = () => {
    return translateServiceDefinitionIdentifier(serviceDefinitionIdentifier);
  };

  return (
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('Platform.UpdateMetadata', { platformName: getPlatformName() })}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-l">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Platform.Name')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('Platform.NamePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="illustration_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Platform.IllustrationImage')}</FormLabel>
                <FormControl>
                  <FileInput
                    name="illustration_document"
                    accept="image/*"
                    onChange={field.onChange}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? t('Utils.Updating')
                : t('Utils.Update')}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetWithPreventingDialog>
  );
};
