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
} from '@filigran/ui';
import { useCase_fragment$data } from '@generated/useCase_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertDialogComponent } from '../../ui/AlertDialog';

export const useCaseFormSchema = z.object({
  name: z.string().min(2, {
    error: 'OrganizationForm.Error.Name',
  }),
  color: z
    .string()
    .refine((value) => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value ?? '')),
});

const UseCaseForm = ({
  useCase,
  handleSubmit,
  handleDelete,
  onClose,
}: {
  useCase?: useCase_fragment$data;
  handleDelete?: () => void;
  handleSubmit: (values: z.infer<typeof useCaseFormSchema>) => void;
  onClose: () => void;
}) => {
  const t = useTranslations();

  const form = useForm<z.infer<typeof useCaseFormSchema>>({
    resolver: zodResolver(useCaseFormSchema),
    defaultValues: {
      name: useCase?.name ?? '',
      color: useCase?.color ?? '',
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
              <FormLabel>{t('UseCaseForm.Name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('UseCaseForm.Name')}
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
              <FormLabel>{t('UseCaseForm.Color')}</FormLabel>
              <ColorPicker
                value={value ?? ''}
                onChange={onChange}
              />
            </FormItem>
          )}
        />

        <SheetFooter className={useCase ? 'sm:justify-between pb-0' : 'pt-2'}>
          {useCase && (
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
              {t('DeleteUseCaseDialog.TextDeleteUseCase', {
                name: useCase.name,
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

export default UseCaseForm;
