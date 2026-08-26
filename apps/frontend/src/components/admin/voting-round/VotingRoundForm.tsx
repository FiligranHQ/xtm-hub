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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetFooter,
  Textarea,
} from '@filigran/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export interface VotingRoundFormModel {
  id: string;
  name: string;
  description?: string | null;
}

export interface VotingRoundCopySource {
  id: string;
  name: string;
}

export const votingRoundFormSchema = z.object({
  name: z.string().min(2, {
    error: 'VotingRound.Form.Error.Name',
  }),
  description: z.string().optional(),
  copy_features_from_round_id: z.string().optional(),
});

const NO_COPY = 'none';

const VotingRoundForm = ({
  votingRound,
  copySources = [],
  onClose,
  handleDelete,
  handleSubmit,
}: {
  votingRound?: VotingRoundFormModel;
  copySources?: VotingRoundCopySource[];
  onClose: () => void;
  handleDelete?: () => void;
  handleSubmit: (values: z.infer<typeof votingRoundFormSchema>) => void;
}) => {
  const t = useTranslations();
  const form = useForm<z.infer<typeof votingRoundFormSchema>>({
    resolver: zodResolver(votingRoundFormSchema),
    defaultValues: {
      name: votingRound?.name ?? '',
      description: votingRound?.description ?? '',
      copy_features_from_round_id: undefined,
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
              <FormLabel>{t('VotingRound.Form.Name')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('VotingRound.Form.Name')}
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
              <FormLabel>{t('VotingRound.Form.Description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('VotingRound.Form.DescriptionPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!votingRound && copySources.length > 0 && (
          <FormField
            control={form.control}
            name="copy_features_from_round_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('VotingRound.Form.CopyFeaturesFrom')}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? NO_COPY}
                    onValueChange={(value) =>
                      field.onChange(value === NO_COPY ? undefined : value)
                    }>
                    <SelectTrigger
                      aria-label={t('VotingRound.Form.CopyFeaturesFrom')}>
                      <SelectValue
                        placeholder={t('VotingRound.Form.CopyFeaturesNone')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_COPY}>
                        {t('VotingRound.Form.CopyFeaturesNone')}
                      </SelectItem>
                      {copySources.map((source) => (
                        <SelectItem
                          key={source.id}
                          value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <SheetFooter
          className={votingRound ? 'sm:justify-between pb-0' : 'pt-2'}>
          {votingRound && (
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
              {t('VotingRound.Dialog.DeleteRound', { name: votingRound.name })}
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

export default VotingRoundForm;
