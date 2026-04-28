'use client';

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
import Markdown from 'react-markdown';
import { z } from 'zod';
import { ServiceFormDescriptionField } from '../service/form/DescriptionField';
import { FiligranProductMapping } from './epic-item/FiligranProductMapping';

export const descriptionValue =
  ' [Long Description] - no limit of chars\n' +
  '### Problem to Solve\n' +
  '            \n' +
  'Description of pain point(s) felt by the user that this Epic is solving. This pain must be specific to this Epic (not a generic, high level pain such as “*Lack of visibility in my threat landscape*”)\n' +
  '         \n' +
  '   ### Proposed Solution\n' +
  'What we are introducing to solve the problem\n' +
  '\n' +
  '### Expected Value\n' +
  'Short point-form list (3-5 points) of what a customer will now be able to do and the value to be gained.\n' +
  "'If EPIC is aimed at a specific persona, worth mentioning it here.\n";
export const FILIGRAN_PRODUCTS_VALUES = Object.values(FiligranProductEnum);
export const TIMELINE_VALUES = Object.values(TimelineEnum);
export const epicFormSchema = z.object({
  product: z.enum(FILIGRAN_PRODUCTS_VALUES),
  title: z.string().min(2, 'EpicForm.Error.Title').max(160),
  short_description: z.string().min(1, 'Required').max(215),
  description: z.string().min(1, 'Required'),
  timeline: z.enum(TIMELINE_VALUES),
  active: z.boolean().optional(),
  is_integration: z.boolean().optional(),
  illustration_document: z.custom<FileList>().optional(),
});

export const DESCRIPTION_END_VALUE_BY_PRODUCT: Record<
  FiligranProductEnum,
  string
> = {
  [FiligranProductEnum.OPENCTI]:
    '\n' +
    'New to the community? For more information and to stay up to date about OpenCTI:\n' +
    '\n' +
    '- [Learn more about OpenCTI](https://filigran.io/platforms/opencti/)\n' +
    '- [Join the OpenCTI community](https://app.slack.com/client/TJ1PH4GBZ/CHZC2D38C)\n' +
    '- [Book a personalized demo](https://filigran.io/book-a-demo/?form_origin=roadmap)\n',
  [FiligranProductEnum.OPENAEV]:
    '\n' +
    'New to the community? For more information and to stay up to date about OpenAEV:\n' +
    '\n' +
    '- [Learn more about OpenAEV](https://filigran.io/platforms/openaev/)\n' +
    '- [Join the OpenEAV community](https://app.slack.com/client/TJ1PH4GBZ/CJ1PHBHF1)\n' +
    '- [Book a personalized demo](https://filigran.io/book-a-demo/?form_origin=roadmap)\n',
  [FiligranProductEnum.OPENGRC]:
    '\n' +
    'New to the community? For more information and to stay up to date about OpenGRC:\n' +
    '\n' +
    '- [Learn more about OpenGRC](https://filigran.io/platforms/xtm-suite/)\n' +
    '- [Join the OpenGRC community](https://app.slack.com/client/TJ1PH4GBZ/C09ETNN9CBS)\n' +
    '- [Book a personalized demo](https://filigran.io/book-a-demo/?form_origin=roadmap)\n',
  [FiligranProductEnum.XTMONE]:
    '\n' +
    'New to the community? For more information and to stay up to date about XTMOne:\n' +
    '\n' +
    '- [Learn more about XTMOne](https://filigran.io/platforms/xtm-suite/)\n' +
    '- [Book a personalized demo](https://filigran.io/book-a-demo/?form_origin=roadmap)\n',
  [FiligranProductEnum.XTMHUB]:
    '\n' +
    'New to the community? For more information and to stay up to date about XTM Hub:\n' +
    '\n' +
    '- [Explore the XTM Hub](https://hub.filigran.io/)\n' +
    '- [Join the XTM Hub community](https://app.slack.com/client/TJ1PH4GBZ/C08HU35NPD4)\n' +
    '- [Book a personalized demo](https://filigran.io/book-a-demo/?form_origin=roadmap)\n',
};

export const getEndDescription = (product?: FiligranProductEnum) => {
  return DESCRIPTION_END_VALUE_BY_PRODUCT[
    product ?? FiligranProductEnum.OPENCTI
  ];
};

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
  const [selectedProduct, setSelectedProduct] = useState<
    FiligranProductEnum | undefined
  >(
    (epic?.product as FiligranProductEnum | undefined) ??
      FiligranProductEnum.OPENCTI
  );

  return (
    <AutoForm
      onSubmit={(values) =>
        handleSubmit({
          ...values,
          description: values.description + getEndDescription(selectedProduct),
        })
      }
      onValuesChange={(values) => {
        setIsIntegration(values.is_integration ?? false);
        setSelectedProduct(
          (values.product as FiligranProductEnum | undefined) ??
            FiligranProductEnum.OPENCTI
        );
      }}
      formSchema={epicFormSchema}
      values={{
        title: epic?.title ?? '',
        short_description: epic?.short_description ?? '',
        description: epic?.description ?? descriptionValue,
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
              <p className="font-semibold txt-default mb-xs">
                {t('Epic.Form.AutomaticallyAdded')}
              </p>
              <div className="bg-page-background rounded border p-m">
                <p className="txt-gray">
                  <Markdown>{getEndDescription(selectedProduct)}</Markdown>
                </p>
              </div>
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
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedProduct(value as FiligranProductEnum);
                }}
                value={field.value ?? FiligranProductEnum.OPENCTI}>
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
      }}>
      <div className="flex justify-end">
        <Button>{epic ? t('Utils.Update') : t('Utils.Create')}</Button>
      </div>
    </AutoForm>
  );
};

export default EpicForm;
