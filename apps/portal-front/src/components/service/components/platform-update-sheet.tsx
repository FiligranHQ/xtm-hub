'use client';

import { UpdatePlatformServiceMetadata } from '@/components/service/service.graphql';
import { IconActionsItem } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { isRegistrationService } from '@/utils/services';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { serviceUpdatePlatformServiceMetadataMutation } from '@generated/serviceUpdatePlatformServiceMetadataMutation.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
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
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { ServiceInstanceCardData } from '../service-instance-card';

const platformUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  illustration_document: z.custom<FileList>().optional(),
});

interface PlatformUpdateSheetProps {
  serviceInstance: ServiceInstanceCardData;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const PlatformUpdateSheetTrigger = (props: {
  setOpenSheet: (openSheet: boolean | null) => void;
}) => {
  const t = useTranslations();

  return (
    <IconActionsItem onClick={() => props.setOpenSheet(true)}>
      {t('Platform.Update')}
    </IconActionsItem>
  );
};

export const PlatformUpdateSheet: FunctionComponent<
  PlatformUpdateSheetProps
> = ({ serviceInstance, open, setOpen }) => {
  const t = useTranslations();
  const { toast } = useToast();

  const [updatePlatformMetadata] =
    useMutation<serviceUpdatePlatformServiceMetadataMutation>(
      UpdatePlatformServiceMetadata
    );

  const form = useForm<z.infer<typeof platformUpdateSchema>>({
    resolver: zodResolver(platformUpdateSchema),
    defaultValues: {
      name: serviceInstance.name,
      illustration_document: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof platformUpdateSchema>) => {
    const document = Array.from(values.illustration_document);

    updatePlatformMetadata({
      variables: {
        input: {
          serviceInstanceId: serviceInstance.id,
          name: values.name,
        },
        document,
      },
      uploadables: fileListToUploadableMap(document),
      onCompleted: (response) => {
        setOpen(false);
        toast({
          title: t('Utils.Success'),
          description: t('Platform.Updated', {
            platformName: response.updatePlatformServiceMetadata!.title,
          }),
        });
        form.reset({
          name: response.updatePlatformServiceMetadata!.title,
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

  // Only show for registration services (OpenCTI/OpenAEV platforms)
  if (!isRegistrationService(serviceInstance)) {
    return null;
  }

  // Get platform name for display
  const getPlatformName = () => {
    const platformIdentifier =
      serviceInstance.service_definition_identifier ===
      ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION
        ? PlatformIdentifierEnum.OPENCTI
        : PlatformIdentifierEnum.OPENAEV;

    return platformIdentifier === PlatformIdentifierEnum.OPENCTI
      ? 'OpenCTI'
      : 'OpenAEV';
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
