'use client';

import { FeatureVotingVoteMutation } from '@/components/feature-voting/feature-voting.graphql';
import { buildSignupRedirect } from '@/utils/redirect';
import { CheckCircleIcon } from '@filigran/icon';
import { toast } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { featureVotingVoteMutation } from '@generated/featureVotingVoteMutation.graphql';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from 'react-relay';

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
  const [commitVote, isInFlight] = useMutation<featureVotingVoteMutation>(
    FeatureVotingVoteMutation
  );

  const handleVote = () => {
    if (!isAuthenticated) {
      router.push(buildSignupRedirect(pathname));
      return;
    }
    commitVote({
      variables: { feature_id: featureId },
      onError(error) {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
      onCompleted() {
        toast({
          title: t('FeatureVoting.VoteRecordedTitle'),
          description: t('FeatureVoting.VoteRecordedDescription'),
        });
      },
    });
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
      disabled={isInFlight}>
      {t('FeatureVoting.Vote')}
    </Button>
  );
};
