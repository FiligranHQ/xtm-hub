'use client';

import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { useEpicListContext } from '@/components/epic/epic-page';
import {
  CreateEpicMutation,
  UpdateEpicMutation,
} from '@/components/epic/epic.graphql';
import { ServiceFormDescriptionField } from '@/components/service/form/description-field';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import {
  AutoForm,
  Button,
  FileInput,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { UploadableMap } from 'relay-runtime';
import { z } from 'zod';
export const FILIGRAN_PRODUCTS_VALUES = Object.values(FiligranProductEnum);
export const TIMELINE_VALUES = Object.values(TimelineEnum);
export const epicFormSchema = z
  .object({
    epic: z.string().min(1, 'Required'),
    title: z.string().min(2, 'EpicForm.Error.Title'),
    short_description: z.string().min(1, 'Required').max(250),
    description: z.string().min(1, 'Required'),
    product: z.enum(FILIGRAN_PRODUCTS_VALUES),
    timeline: z.enum(TIMELINE_VALUES),
    active: z.boolean().optional(),
    is_integration: z.boolean().optional(),
    illustration_document: z.custom<FileList>().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_integration && !data.illustration_document) {
      ctx.addIssue({
        code: 'custom',
        path: ['illustration_document'],
        message: 'Required when integration',
      });
    }
  });

const EpicForm = ({
  epic,
  onClose,
}: {
  epic?: epic_fragment$data;
  onClose: () => void;
}) => {
  const t = useTranslations();
  const [commitEpicMutation] = useMutation(CreateEpicMutation);
  const [updateEpicMutation] = useMutation(UpdateEpicMutation);
  const { toast } = useToast();
  const { connectionID, filterByProduct } = useEpicListContext();
  const [isIntegration, setIsIntegration] = useState(
    epic?.epic_type === EpicTypeEnum.INTEGRATION
  );
  const isCreation = !epic;

  const createEpic = (
    inputValues: z.infer<typeof epicFormSchema>,
    uploadables: UploadableMap | undefined,
    document: File[] | undefined
  ) => {
    commitEpicMutation({
      variables: {
        input: { ...inputValues },
        connections: [connectionID],
        document,
      },
      uploadables,
      onCompleted: () => {
        onClose();
        filterByProduct(inputValues.product);
        toast({
          title: t('Utils.Success'),
          description: t('Utils.Success'),
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
  const updateEpic = (
    inputValues: z.infer<typeof epicFormSchema>,
    uploadables: UploadableMap | undefined,
    document: File[] | undefined
  ) => {
    updateEpicMutation({
      variables: {
        id: epic!.id,
        input: { ...inputValues },
        document,
      },
      uploadables,
      onCompleted: () => {
        onClose();
        toast({
          title: t('Utils.Success'),
          description: t('Utils.Success'),
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

  const onSubmit = (values: z.infer<typeof epicFormSchema>) => {
    const document = !values.illustration_document
      ? undefined
      : Array.from(values.illustration_document);
    const uploadables = !document
      ? undefined
      : fileListToUploadableMap(document);

    const { illustration_document: _illustration, ...inputValues } = values;

    if (isCreation) {
      createEpic(inputValues, uploadables, document);
    } else {
      updateEpic(inputValues, uploadables, document);
    }
  };

  return (
    <AutoForm
      onSubmit={onSubmit}
      onValuesChange={(values) => {
        setIsIntegration(values.is_integration ?? false);
      }}
      formSchema={epicFormSchema}
      values={{
        epic: epic?.epic ?? '',
        title: epic?.title ?? '',
        short_description: epic?.short_description ?? '',
        description: epic?.description ?? '',
        product: epic?.product as FiligranProductEnum,
        timeline: epic?.timeline as TimelineEnum,
        active: epic?.active ?? false,
        is_integration: epic?.epic_type === EpicTypeEnum.INTEGRATION,
        illustration_document: undefined,
      }}
      fieldConfig={{
        short_description: {
          label: t('Epic.Form.ShortDesc'),
        },
        description: {
          fieldType: ({
            field,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
          }) => (
            <ServiceFormDescriptionField
              field={field}
              documentType={'Epic'}
            />
          ),
        },
        product: {
          fieldType: ({
            field,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
          }) => (
            <FormItem>
              <FormLabel>{t('Epic.Form.FiligranProduct')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={epic?.product}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('Epic.Form.FiligranProductPlaceholder')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(FiligranProductEnum).map((product) => {
                    return (
                      <SelectItem
                        key={product}
                        value={product}>
                        {FiligranProductMapping[product].name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          ),
        },
        timeline: {
          fieldType: ({
            field,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
          }) => (
            <FormItem>
              <FormLabel>{t('Epic.Form.Timeline')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={epic?.timeline}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Epic.Timeline.NOW')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TimelineEnum).map((timeline) => {
                    return (
                      <SelectItem
                        key={timeline}
                        value={timeline}>
                        {t(`Epic.Timeline.${timeline.toUpperCase()}`)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          ),
        },
        illustration_document: {
          fieldType: ({ field }) => {
            if (!isIntegration) return null;
            return (
              <FormItem>
                <FormLabel>{t('Service.Form.Illustration')}</FormLabel>
                <FormControl>
                  <FileInput
                    {...field}
                    texts={{
                      selectFile: t('Service.Vault.FileForm.SelectDocument'),
                      noFile: t('Service.Vault.FileForm.NoDocument'),
                      dropFiles: t('Service.Vault.FileForm.DropDocuments'),
                    }}
                    allowedTypes={'image/jpeg, image/gif, image/png, image/svg'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          },
        },
        active: {
          label: t('Epic.Form.IsActive'),
        },
        is_integration: {
          label: t('Epic.Form.Integration'),
        },
      }}>
      <div className="flex justify-end">
        <Button>{epic ? t('Utils.Update') : t('Utils.Create')}</Button>
      </div>
    </AutoForm>
  );
};

export default EpicForm;
