import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { FeatureVoteButton } from '@/components/feature-voting/FeatureVoteButton';
import MarkdownRendererWithTheme from '@/components/ui/MarkdownRendererWithTheme';
import { Separator } from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { VotableFeaturePublicFragment } from '@graphql/generated';
import Image from 'next/image';

const BADGE_CLASS =
  'border-0 content-body-compact-medium bg-feedback-info-secondary-transparency';

interface FeatureVoteDetailProps {
  feature: VotableFeaturePublicFragment;
  isAuthenticated: boolean;
}

export const FeatureVoteDetail = ({
  feature,
  isAuthenticated,
}: FeatureVoteDetailProps) => {
  return (
    <div className="p-l bg-elevation-background-layer-1 markdown-content flex h-full min-h-0 flex-1 flex-col gap-m">
      <h2>{feature.title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {feature.image_url && (
          <div className="relative mb-m h-48 w-full">
            <Image
              src={feature.image_url}
              alt={feature.title}
              fill
              className="rounded object-cover"
            />
          </div>
        )}
        <MarkdownRendererWithTheme source={feature.description} />
      </div>
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-m">
        <div className="flex flex-wrap items-center gap-m">
          <span className="flex items-center gap-s">
            {FiligranProductMapping[feature.product].logo}
            {FiligranProductMapping[feature.product].name}
          </span>
          {feature.labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-s">
              {feature.labels.map((label) => (
                <Badge
                  key={label}
                  className={BADGE_CLASS}>
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <FeatureVoteButton
          featureId={feature.id}
          hasMyVote={feature.has_my_vote}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};
