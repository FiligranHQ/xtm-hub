import VotableFeatureForm, {
  parseLabels,
  VotableFeatureFormModel,
  VotableFeatureFormValues,
} from '@/components/admin/voting-round/VotableFeatureForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { toast } from '@filigran/ui';
import {
  useVotableFeatureDeleteMutation,
  useVotableFeatureUpdateMutation,
} from '@graphql/generated';
import { votingRoundKeys } from '@graphql/voting-round/voting-round.keys';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const EditVotableFeature = ({
  open,
  onClose,
  feature,
}: {
  open: boolean;
  onClose: () => void;
  feature: VotableFeatureFormModel;
}) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [openSheet, setOpenSheet] = useState<boolean>(open);

  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof Error ? error.message : 'UnknownError';
    toast({
      variant: 'destructive',
      title: t('Utils.Error'),
      description: <>{t(`Error.Server.${errorMessage}`)}</>,
    });
  };

  const handleOpenSheet = (openValue: boolean) => {
    setOpenSheet((previousState) => {
      const sheetIsClosing = previousState !== openValue && !openValue;
      if (sheetIsClosing) {
        onClose();
      }
      return openValue;
    });
  };

  const invalidateRounds = () => {
    queryClient.invalidateQueries({ queryKey: votingRoundKeys.all() });
    queryClient.invalidateQueries({ queryKey: votingRoundKeys.detailAll() });
  };

  const { mutate: updateVotableFeature } = useVotableFeatureUpdateMutation(
    portalGraphqlClient,
    {
      onSuccess: () => {
        toast({ title: t('Utils.Success') });
        invalidateRounds();
        handleOpenSheet(false);
      },
      onError: handleError,
    }
  );

  const { mutate: deleteVotableFeature } = useVotableFeatureDeleteMutation(
    portalGraphqlClient,
    {
      onSuccess: () => {
        toast({ title: t('Utils.Success') });
        invalidateRounds();
        handleOpenSheet(false);
      },
      onError: handleError,
    }
  );

  const onUpdate = (values: VotableFeatureFormValues) => {
    updateVotableFeature({
      id: feature.id,
      input: {
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
      title={t('VotingRound.Feature.Actions.Edit')}
      setOpen={handleOpenSheet}
      open={openSheet}>
      <VotableFeatureForm
        key={feature.id}
        feature={feature}
        onClose={() => handleOpenSheet(false)}
        handleDelete={() => deleteVotableFeature({ id: feature.id })}
        handleSubmit={onUpdate}
      />
    </SheetWithPreventingDialog>
  );
};

export default EditVotableFeature;
