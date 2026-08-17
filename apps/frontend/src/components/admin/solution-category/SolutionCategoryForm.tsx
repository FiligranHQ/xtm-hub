import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MultiSelectFormField,
  SheetFooter,
} from '@filigran/ui';
import { FiligranProduct } from '@graphql/generated';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from '@tolgee/react';
const productValues = Object.values(FiligranProduct) as [
  FiligranProduct,
  ...FiligranProduct[],
];

const productOptions = productValues.map((product) => ({
  id: product,
  label: product.toUpperCase(),
}));

export interface SolutionCategoryFormModel {
  id: string;
  name: string;
  product: FiligranProduct[];
}

export const solutionCategoryFormSchema = z.object({
  name: z.string().min(2, {
    error: 'SolutionCategory.Form.Error.Name',
  }),
  product: z.array(z.enum(productValues)),
});

const SolutionCategoryForm = ({
  solutionCategory,
  onClose,
  handleDelete,
  handleSubmit,
}: {
  solutionCategory?: SolutionCategoryFormModel;
  onClose: () => void;
  handleDelete?: () => void;
  handleSubmit: (values: z.infer<typeof solutionCategoryFormSchema>) => void;
}) => {
  const { t } = useTranslate();
  const form = useForm<z.infer<typeof solutionCategoryFormSchema>>({
    resolver: zodResolver(solutionCategoryFormSchema),
    defaultValues: {
      name: solutionCategory?.name ?? '',
      product: solutionCategory?.product ?? [],
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
              <FormLabel>{t('SolutionCategory_Form_Name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('SolutionCategory_Form_Name')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('SolutionCategory_Form_Product')}</FormLabel>
              <FormControl>
                <MultiSelectFormField
                  options={productOptions}
                  popoverContentClassName="bg-elevation-background-layer-3"
                  keyValue="id"
                  keyLabel="label"
                  defaultValue={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                  noResultString={t('Utils_NotFound')}
                  placeholder={t('SolutionCategory_Form_Product')}
                  variant="inverted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter
          className={solutionCategory ? 'sm:justify-between pb-0' : 'pt-2'}>
          {solutionCategory && (
            <AlertDialogComponent
              AlertTitle={t('MenuActions_Delete')}
              actionButtonText={t('MenuActions_Delete')}
              variantName="destructive"
              triggerElement={
                <Button variant="secondary-destructive">
                  {t('MenuActions_Delete')}
                </Button>
              }
              onClickContinue={() => handleDelete!()}>
              {t('SolutionCategory_Dialog_Text', {
                name: solutionCategory.name,
              })}
            </AlertDialogComponent>
          )}
          <div className="flex gap-s">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}>
              {t('Utils_Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isDirty}
              type="submit">
              {t('Utils_Validate')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
};

export default SolutionCategoryForm;
