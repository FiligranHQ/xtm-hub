import { Badge } from '@filigran/ui';
import { VotingRoundStatus } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const BADGE_VARIANT: Record<
  VotingRoundStatus,
  'outline' | 'default' | 'secondary'
> = {
  [VotingRoundStatus.Draft]: 'outline',
  [VotingRoundStatus.Open]: 'default',
  [VotingRoundStatus.Closed]: 'secondary',
};

export const VotingRoundStatusBadge = ({
  status,
}: {
  status: VotingRoundStatus;
}) => {
  const t = useTranslations();
  return (
    <Badge variant={BADGE_VARIANT[status]}>
      {t(`VotingRound.Status.${status}`)}
    </Badge>
  );
};
