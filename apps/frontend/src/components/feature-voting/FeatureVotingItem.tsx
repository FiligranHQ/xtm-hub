'use client';

import { FeatureVoteCard } from '@/components/feature-voting/FeatureVoteCard';
import { FeatureVoteDetail } from '@/components/feature-voting/FeatureVoteDetail';
import { Dialog, DialogContent } from '@filigran/ui';
import { VotableFeaturePublicFragment } from '@graphql/generated';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface FeatureVotingItemProps {
  feature: VotableFeaturePublicFragment;
  isAuthenticated: boolean;
}

export const FeatureVotingItem = ({
  feature,
  isAuthenticated,
}: FeatureVotingItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derived from the URL so a feature detail can be linked to and shared.
  const isOpen = searchParams.get('featureId') === feature.id;

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('featureId');

        const queryString = params.toString();
        const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(targetUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams]
  );

  return (
    <li className="group">
      <FeatureVoteCard
        feature={feature}
        isAuthenticated={isAuthenticated}
      />
      <Dialog
        open={isOpen}
        onOpenChange={handleClose}>
        <DialogContent className="flex h-[80vh] max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden p-0">
          <FeatureVoteDetail
            feature={feature}
            isAuthenticated={isAuthenticated}
          />
        </DialogContent>
      </Dialog>
    </li>
  );
};
