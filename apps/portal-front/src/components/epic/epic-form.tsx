'use client';

import { getEpicListContext } from '@/components/epic/epic-page';
import { CreateEpicMutation } from '@/components/epic/epic.graphql';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { AutoForm, Button, useToast } from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EpicTypeEnum } from '@generated/models/EpicType.enum';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { TimelineEnum } from '@generated/models/Timeline.enum';
import { useTranslations } from 'next-intl';
import { useMutation } from 'react-relay';
import { z } from 'zod';
export const FILIGRAN_PRODUCTS_VALUES = Object.values(FiligranProductEnum);
export const TIMELINE_VALUES = Object.values(TimelineEnum);
export const epicFormSchema = z.object({
  epic: z.string().min(1, 'Required'),
  title: z.string().min(2, 'EpicForm.Error.Title'),
  short_description: z.string().min(1, 'Required').max(250),
  long_description: z.string().min(1, 'Required'),
  product: z.enum(FILIGRAN_PRODUCTS_VALUES),
  timeline: z.enum(TIMELINE_VALUES),
  is_active: z.boolean().optional(),
  is_integration: z.boolean().optional(),
  illustration_document: z.custom<FileList>().optional(),
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
  const { toast } = useToast();
  const { connectionID } = getEpicListContext();

  const onSubmit = (values: z.infer<typeof epicFormSchema>) => {
    const document = !values.illustration_document
      ? undefined
      : Array.from(values.illustration_document);
    const uploadables = !document
      ? undefined
      : fileListToUploadableMap(document);

    const { illustration_document: _illustration, ...inputValues } = values;

    commitEpicMutation({
      variables: {
        input: { ...inputValues },
        connections: [connectionID],
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

  return (
    <AutoForm
      onSubmit={onSubmit}
      formSchema={epicFormSchema}
      values={{
        epic: epic?.epic ?? '',
        title: epic?.title ?? '',
        short_description: epic?.short_description ?? '',
        long_description: epic?.long_description ?? '',
        product: epic?.product as FiligranProductEnum,
        timeline: epic?.timeline as TimelineEnum,
        is_active: epic?.is_active ?? false,
        is_integration: epic?.epic_type === EpicTypeEnum.INTEGRATION,
        illustration_document: undefined,
      }}
      fieldConfig={{
        illustration_document: {
          label: t('Service.Form.Illustration'),
          fieldType: 'file',
          inputProps: {
            accept: 'image/jpeg, image/png',
          },
        },
      }}>
      <div className="flex justify-end">
        <Button>{t('Utils.Update')}</Button>
      </div>
    </AutoForm>
  );
};

export default EpicForm;
