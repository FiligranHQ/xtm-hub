import VotableFeatureForm, {
  parseLabels,
  VotableFeatureFormValues,
} from '@/components/admin/voting-round/VotableFeatureForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { Button, toast } from '@filigran/ui';
import { useVotableFeatureCreateMutation } from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { invalidateVotingRoundQueries } from './voting-round-query-invalidation';

const AddVotableFeature = ({ roundId }: { roundId: string }) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: createVotableFeature } = useVotableFeatureCreateMutation(
    portalGraphqlClient,
    {
      onSuccess: () => {
        setOpenSheet(false);
        invalidateVotingRoundQueries(queryClient);
        toast({ title: t('Utils.Success') });
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'UnknownError';
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: <>{t(`Error.Server.${errorMessage}`)}</>,
        });
      },
    }
  );

  const onSubmit = (values: VotableFeatureFormValues) => {
    createVotableFeature({
      input: {
        voting_round_id: roundId,
        title: values.title,
        short_description: values.short_description,
        description: values.description,
        product: values.product,
        labels: parseLabels(values.labels),
        image_url: values.image_url || null,
        position: Number(values.position),
        active: values.active,
      },
    });
  };

  return (
    <SheetWithPreventingDialog
      title={t('VotingRound.Feature.Actions.Add')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<Button>{t('VotingRound.Feature.Actions.Add')}</Button>}>
      <VotableFeatureForm
        onClose={() => setOpenSheet(false)}
        handleSubmit={onSubmit}
      />
    </SheetWithPreventingDialog>
  );
};

export default AddVotableFeature;
