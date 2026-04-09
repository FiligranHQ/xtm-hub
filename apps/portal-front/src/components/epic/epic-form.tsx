'use client';

import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { ServiceFormDescriptionField } from '@/components/service/form/description-field';
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
} from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { z } from 'zod';
export const FILIGRAN_PRODUCTS_VALUES = Object.values(FiligranProductEnum);
export const TIMELINE_VALUES = Object.values(TimelineEnum);
export const epicFormSchema = z.object({
  title: z.string().min(2, 'EpicForm.Error.Title').max(160),
  short_description: z.string().min(1, 'Required').max(215),
  description: z.string().min(1, 'Required'),
  product: z.enum(FILIGRAN_PRODUCTS_VALUES),
  timeline: z.enum(TIMELINE_VALUES),
  active: z.boolean().optional(),
  is_integration: z.boolean().optional(),
  illustration_document: z.custom<FileList>().optional(),
});

const EpicForm = ({
  epic,
  handleSubmit,
}: {
  epic?: epic_fragment$data;
  handleSubmit: (values: z.infer<typeof epicFormSchema>) => void;
}) => {
  const t = useTranslations();

  const [isIntegration, setIsIntegration] = useState(
    epic?.epic_type === EpicTypeEnum.INTEGRATION
  );

  return (
    <AutoForm
      onSubmit={handleSubmit}
      onValuesChange={(values) => {
        setIsIntegration(values.is_integration ?? false);
      }}
      formSchema={epicFormSchema}
      values={{
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
                    <SelectValue placeholder={t('Epic.Timeline.now')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TimelineEnum).map((timeline) => {
                    return (
                      <SelectItem
                        key={timeline}
                        value={timeline}>
                        {t(`Epic.Timeline.${timeline.toLowerCase()}`)}
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
