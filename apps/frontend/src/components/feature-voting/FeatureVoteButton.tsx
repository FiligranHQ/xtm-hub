'use client';

import { portalGraphqlClient } from '@/lib/graphql-client';
import { buildSignupRedirect } from '@/utils/redirect';
import { CheckCircleIcon } from '@filigran/icon';
import { toast } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { featureVotingKeys } from '@graphql/feature-voting/feature-voting.keys';
import { useFeatureVoteMutation } from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

interface FeatureVoteButtonProps {
  featureId: string;
  hasMyVote: boolean;
  isAuthenticated: boolean;
  className?: string;
}

export const FeatureVoteButton = ({
  featureId,
  hasMyVote,
  isAuthenticated,
  className,
}: FeatureVoteButtonProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { mutate: commitVote, isPending } = useFeatureVoteMutation(
    portalGraphqlClient,
    {
      onSuccess: () => {
        // A vote moves the one vote allowed per product, so the whole round has
        // to be refetched for the previously voted feature to lose its badge.
        queryClient.invalidateQueries({
          queryKey: featureVotingKeys.currentAll(),
        });
        toast({
          title: t('FeatureVoting.VoteRecordedTitle'),
          description: t('FeatureVoting.VoteRecordedDescription'),
        });
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

  const handleVote = () => {
    if (!isAuthenticated) {
      router.push(buildSignupRedirect(pathname));
      return;
    }
    commitVote({ feature_id: featureId });
  };

  if (hasMyVote) {
    return (
      <Button
        variant="secondary"
        className={className}
        disabled>
        <CheckCircleIcon className="mr-s size-4" />
        {t('FeatureVoting.Voted')}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      onClick={handleVote}
      disabled={isPending}>
      {t('FeatureVoting.Vote')}
    </Button>
  );
};
