'use client';

import { EditionTypeMapping } from '@/components/epic/epic-item/EditionTypeMapping';
import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { ServiceFormDescriptionField } from '@/components/service/form/DescriptionField';
import {
  AutoForm,
  Button,
  FileInput,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EditionTypeEnum } from '@generated/models/EditionType.enum';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { z } from 'zod';

export const descriptionValue =
  ' [Long Description] - no limit of chars\n' +
  '### Problem to Solve\n' +
  '            \n' +
  'Description of pain point(s) felt by the user that this Epic is solving. This pain must be specific to this Epic (not a generic, high level pain such as “*Lack of visibility in my threat landscape*”)\n' +
  '         \n' +
  '### Proposed Solution\n' +
  'What we are introducing to solve the problem\n' +
  '\n' +
  '### Expected Value\n' +
  'Short point-form list (3-5 points) of what a customer will now be able to do and the value to be gained.\n' +
  "'If EPIC is aimed at a specific persona, worth mentioning it here.\n";
export const FILIGRAN_PRODUCTS_VALUES = Object.values(FiligranProductEnum);
export const TIMELINE_VALUES = Object.values(TimelineEnum);
export const epicFormSchema = z.object({
  product: z.enum(FILIGRAN_PRODUCTS_VALUES),
  edition_type: z.enum(EditionTypeEnum),
  title: z.string().min(2, 'EpicForm.Error.Title').max(160),
  short_description: z.string().min(1, 'Required').max(215),
  description: z.string().min(1, 'Required'),
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
      onSubmit={(values) => handleSubmit(values)}
      onValuesChange={(values) => {
        setIsIntegration(values.is_integration ?? false);
      }}
      formSchema={epicFormSchema}
      values={{
        title: epic?.title ?? '',
        short_description: epic?.short_description ?? '',
        description: epic?.description ?? descriptionValue,
        edition_type:
          (epic?.edition_type as EditionTypeEnum) ??
          EditionTypeEnum.COMMUNITY_EDITION,
        product:
          (epic?.product as FiligranProductEnum) ?? FiligranProductEnum.OPENCTI,
        timeline: (epic?.timeline as TimelineEnum) ?? TimelineEnum.NOW,
        active: epic?.active ?? false,
        is_integration: epic?.epic_type === EpicTypeEnum.INTEGRATION,
        illustration_document: undefined,
      }}
      fieldConfig={{
        title: {
          inputProps: {
            placeholder: t('Epic.Form.IsLimited', { maxChars: '160' }),
          },
        },
        short_description: {
          label: t('Epic.Form.ShortDesc'),
          inputProps: {
            placeholder: t('Epic.Form.IsLimited', { maxChars: '215' }),
          },
        },
        description: {
          fieldType: ({
            field,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
          }) => (
            <>
              <ServiceFormDescriptionField
                field={field}
                documentType={'Epic'}
                required
              />
            </>
          ),
        },
        product: {
          fieldType: ({
            field,
          }: {
            field: ControllerRenderProps<FieldValues, string>;
          }) => (
            <FormItem>
              <FormLabel>
                {t('Epic.Form.FiligranProduct')}
                <span className="text-sm text-destructive"> *</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={epic?.product ?? FiligranProductEnum.OPENCTI}>
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
              <FormLabel>
                {t('Epic.Form.Timeline')}
                <span className="text-sm text-destructive"> *</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={epic?.timeline ?? TimelineEnum.NOW}>
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
        edition_type: {
          fieldType: ({ field }) => (
            <FormItem>
              <FormLabel>{t('Epic.Form.EditionType')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value ?? EditionTypeEnum.COMMUNITY_EDITION}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {Object.values(EditionTypeEnum).map((value) => (
                    <FormItem
                      key={value}
                      className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={value} />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        {EditionTypeMapping[value].label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          ),
        },
      }}>
      <div className="flex justify-end">
        <Button>{epic ? t('Utils.Update') : t('Utils.Create')}</Button>
      </div>
    </AutoForm>
  );
};

export default EpicForm;
