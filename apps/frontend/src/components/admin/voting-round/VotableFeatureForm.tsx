import { isAllowedImageUrl } from '@/components/admin/voting-round/votable-feature.utils';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import MarkdownInput from '@/components/ui/MarkdownInput';
import { DeleteIcon } from '@filigran/icon';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
  Switch,
} from '@filigran/ui';
import { FiligranProduct } from '@graphql/generated';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const productValues = Object.values(FiligranProduct) as [
  FiligranProduct,
  ...FiligranProduct[],
];

export interface VotableFeatureFormModel {
  id: string;
  title: string;
  short_description: string;
  description: string;
  product: FiligranProduct;
  labels: string[];
  image_url?: string | null;
  position: number;
  active: boolean;
}

export const votableFeatureFormSchema = z.object({
  title: z.string().min(2, { error: 'VotingRound.Feature.Error.Title' }),
  short_description: z
    .string()
    .min(2, { error: 'VotingRound.Feature.Error.ShortDescription' }),
  description: z
    .string()
    .min(2, { error: 'VotingRound.Feature.Error.Description' }),
  product: z.enum(productValues),
  labels: z.string().optional(),
  // next/image serves local paths directly and only allows the remote hosts of
  // the CSP allow-list, so any other absolute URL would break the public page.
  image_url: z
    .string()
    .refine((value) => value === '' || isAllowedImageUrl(value), {
      error: 'VotingRound.Feature.Error.ImageUrl',
    })
    .optional(),
  position: z.string().regex(/^\d+$/, {
    error: 'VotingRound.Feature.Error.Position',
  }),
  active: z.boolean(),
});

export type VotableFeatureFormValues = z.infer<typeof votableFeatureFormSchema>;

/** Labels are edited as a comma-separated list and stored as an array. */
export const parseLabels = (labels?: string): string[] =>
  (labels ?? '')
    .split(',')
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

const VotableFeatureForm = ({
  feature,
  onClose,
  handleDelete,
  handleSubmit,
}: {
  feature?: VotableFeatureFormModel;
  onClose: () => void;
  handleDelete?: () => void;
  handleSubmit: (values: VotableFeatureFormValues) => void;
}) => {
  const t = useTranslations();
  const form = useForm<VotableFeatureFormValues>({
    resolver: zodResolver(votableFeatureFormSchema),
    defaultValues: {
      title: feature?.title ?? '',
      short_description: feature?.short_description ?? '',
      description: feature?.description ?? '',
      product: feature?.product ?? FiligranProduct.Opencti,
      labels: feature?.labels.join(', ') ?? '',
      image_url: feature?.image_url ?? '',
      position: String(feature?.position ?? 0),
      active: feature?.active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form
        className="w-full space-y-l"
        onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.Title')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('VotingRound.Feature.Title')}
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
              <FormLabel>{t('VotingRound.Feature.Product')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}>
                  <SelectTrigger aria-label={t('VotingRound.Feature.Product')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productValues.map((product) => (
                      <SelectItem
                        key={product}
                        value={product}>
                        {product.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.ShortDescription')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('VotingRound.Feature.ShortDescription')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.Description')}</FormLabel>
              <FormControl>
                <MarkdownInput
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder={t('VotingRound.Feature.DescriptionPlaceholder')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="labels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.Labels')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('VotingRound.Feature.LabelsPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.ImageUrl')}</FormLabel>
              {field.value && (
                <div
                  style={{
                    backgroundImage: `url(${field.value})`,
                    backgroundSize: 'cover',
                  }}
                  className="relative min-h-[10rem] rounded border">
                  <div className="flex h-12 flex-row items-center bg-elevation-background-layer-1 opacity-90">
                    <div className="ml-s mr-s min-w-0 flex-1 truncate">
                      {field.value}
                    </div>
                    <Button
                      variant="secondary-destructive"
                      size="icon"
                      type="button"
                      aria-label={t('VotingRound.Feature.RemoveImage')}
                      className="m-s ml-auto"
                      onClick={() => field.onChange('')}>
                      <DeleteIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
              <FormControl>
                <Input
                  placeholder={t('VotingRound.Feature.ImageUrlPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('VotingRound.Feature.Position')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-s space-y-0">
              <FormLabel>{t('VotingRound.Feature.Active')}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label={t('VotingRound.Feature.Active')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className={feature ? 'sm:justify-between pb-0' : 'pt-2'}>
          {feature && (
            <AlertDialogComponent
              AlertTitle={t('MenuActions.Delete')}
              actionButtonText={t('MenuActions.Delete')}
              variantName="destructive"
              triggerElement={
                <Button variant="secondary-destructive">
                  {t('MenuActions.Delete')}
                </Button>
              }
              onClickContinue={() => handleDelete!()}>
              {t('VotingRound.Dialog.DeleteFeature', { title: feature.title })}
            </AlertDialogComponent>
          )}
          <div className="flex gap-s">
            <Button
              variant="secondary"
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

export default VotableFeatureForm;
