import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { label_fragment$data } from '@generated/label_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ColorPicker,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  SheetFooter,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const labelFormSchema = z.object({
  name: z.string().min(2, { message: 'OrganizationForm.Error.Name' }),
  color: z
    .string()
    .refine((value) => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value ?? '')),
});

const LabelForm = ({
  label,
  handleSubmit,
  handleDelete,
  onClose,
}: {
  label?: label_fragment$data;
  handleDelete?: () => void;
  handleSubmit: (values: z.infer<typeof labelFormSchema>) => void;
  onClose: () => void;
}) => {
  const t = useTranslations();

  const form = useForm<z.infer<typeof labelFormSchema>>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: label?.name ?? '',
      color: label?.color ?? '',
    },
  });

  return (
    <Form {...form}>
      <form
        className="w-full space-y-xl"
        onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('LabelForm.Name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('LabelForm.Name')}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>{t('LabelForm.Color')}</FormLabel>
              <ColorPicker
                value={value ?? ''}
                onChange={onChange}
              />
            </FormItem>
          )}
        />

        <SheetFooter className={label ? 'sm:justify-between pb-0' : 'pt-2'}>
          {label && (
            <AlertDialogComponent
              AlertTitle={t('MenuActions.Delete')}
              actionButtonText={t('MenuActions.Delete')}
              variantName={'destructive'}
              triggerElement={
                <Button variant="outline-destructive">
                  {t('MenuActions.Delete')}
                </Button>
              }
              onClickContinue={() => handleDelete!()}>
              {t('DeleteLabelDialog.TextDeleteLabel', {
                name: label.name,
              })}
            </AlertDialogComponent>
          )}
          <div className="flex gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isDirty}
              type="submit">
              {t('Utils.Validate')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
};

export default LabelForm;
