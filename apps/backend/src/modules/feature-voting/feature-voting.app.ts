import {
  CreateVotableFeatureInput,
  CreateVotingRoundInput,
  FiligranProduct,
  UpdateVotableFeatureInput,
  UpdateVotingRoundInput,
  VotingRoundStatus,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { VotableFeatureId } from '../../model/kanel/public/VotableFeature';
import VotingRound, {
  VotingRoundId,
} from '../../model/kanel/public/VotingRound';
import {
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { stripNulls } from '../../utils/typescript';
import {
  featureVotingDomain,
  VotableFeatureWithVote,
} from './feature-voting.domain';

export type VotingRoundWithFeatures = VotingRound & {
  features: VotableFeatureWithVote[];
};

export interface VotingRoundResults {
  round: VotingRoundWithFeatures;
  total_voters: number;
  results: { feature: VotableFeatureWithVote; vote_count: number }[];
}

const requireRound = async (id: VotingRoundId): Promise<VotingRound> => {
  const round = await featureVotingDomain.loadVotingRoundBy({ id });
  if (!round) {
    throw new Error(NotFoundErrorCode.VotingRoundNotFound);
  }
  return round;
};

/**
 * Attaches the features of a round, flagged with the caller's own vote.
 *
 * `onlyActive` is a property of the audience, never of the round status: the
 * public page must not list a deactivated feature, while the admin screens must
 * always list it — otherwise deactivating a feature of an open round would make
 * it unreachable, and impossible to reactivate.
 */
const withFeatures = async (
  round: VotingRound,
  opts: { onlyActive: boolean; product?: FiligranProduct | null }
): Promise<VotingRoundWithFeatures> => {
  const user = requestContext.get()?.user;
  const features = await featureVotingDomain.loadVotableFeatures({
    roundId: round.id,
    product: opts.product,
    onlyActive: opts.onlyActive,
    userId: user?.id,
  });
  return { ...round, features };
};

/** Rounds returned by the BYPASS-only admin fields, features included. */
const withAllFeatures = (round: VotingRound) =>
  withFeatures(round, { onlyActive: false });

/** Nulls stripped everywhere, except on the fields declared as clearable. */
type UpdateFields<T, K extends keyof T> = {
  [P in keyof T]: P extends K
    ? T[P]
    : null extends T[P]
      ? Exclude<T[P], null> | undefined
      : T[P];
};

/**
 * `stripNulls` protects non-nullable columns from being overwritten with null,
 * but it also swallows the explicit null the admin sends to clear a nullable
 * column. Clearable fields are therefore reapplied afterwards, so `undefined`
 * still means "leave untouched" while `null` means "clear".
 */
const applyUpdate = <T extends object, K extends keyof T>(
  input: T,
  clearableFields: readonly K[]
): UpdateFields<T, K> => {
  const fields = stripNulls(input) as UpdateFields<T, K>;
  for (const field of clearableFields) {
    if (field in input && input[field] === null) {
      (fields as Record<K, T[K]>)[field] = input[field];
    }
  }
  return fields;
};

export const featureVotingApp = {
  loadCurrentVotingRound: async (): Promise<VotingRoundWithFeatures | null> => {
    const round = await featureVotingDomain.loadVotingRoundBy({
      status: VotingRoundStatus.Open,
    });
    return round ? withFeatures(round, { onlyActive: true }) : null;
  },

  voteForFeature: async (
    featureId: VotableFeatureId
  ): Promise<VotableFeatureWithVote[]> => {
    const user = requestContext.requireUser();

    const feature = await featureVotingDomain.loadVotableFeatureBy({
      id: featureId,
    });
    if (!feature || !feature.active) {
      throw new Error(NotFoundErrorCode.VotableFeatureNotFound);
    }

    const round = await requireRound(feature.voting_round_id);
    if (round.status !== VotingRoundStatus.Open) {
      throw new Error(ForbiddenErrorCode.VotingRoundNotOpen);
    }

    await featureVotingDomain.upsertFeatureVote({
      user_id: user.id,
      voting_round_id: round.id,
      votable_feature_id: feature.id,
      product: feature.product,
      created_at: new Date(),
    });

    return featureVotingDomain.loadVotableFeatures({
      roundId: round.id,
      product: feature.product,
      onlyActive: true,
      userId: user.id,
    });
  },

  loadVotingRounds: async (): Promise<VotingRoundWithFeatures[]> => {
    const rounds = await featureVotingDomain.loadVotingRounds();
    return Promise.all(rounds.map((round) => withAllFeatures(round)));
  },

  loadVotingRound: async (
    id: VotingRoundId
  ): Promise<VotingRoundWithFeatures | null> => {
    const round = await featureVotingDomain.loadVotingRoundBy({ id });
    return round ? withAllFeatures(round) : null;
  },

  createVotingRound: async (
    input: CreateVotingRoundInput
  ): Promise<VotingRoundWithFeatures> => {
    const user = requestContext.requireUser();
    const { copy_features_from_round_id, ...roundInput } = input;

    const round = await featureVotingDomain.insertVotingRound({
      ...stripNulls(roundInput),
      status: VotingRoundStatus.Draft,
      creator_id: user.id,
      created_at: new Date(),
    });

    if (copy_features_from_round_id) {
      const sourceRound = await requireRound(copy_features_from_round_id);
      const sourceFeatures = await featureVotingDomain.loadVotableFeatures({
        roundId: sourceRound.id,
      });
      await featureVotingDomain.insertVotableFeatures(
        sourceFeatures.map((feature) => ({
          voting_round_id: round.id,
          title: feature.title,
          short_description: feature.short_description,
          description: feature.description,
          product: feature.product,
          labels: feature.labels,
          image_url: feature.image_url,
          position: feature.position,
          active: feature.active,
          created_at: new Date(),
        }))
      );
    }

    return withAllFeatures(round);
  },

  updateVotingRound: async (
    id: VotingRoundId,
    input: UpdateVotingRoundInput
  ): Promise<VotingRoundWithFeatures> => {
    await requireRound(id);
    const updated = await featureVotingDomain.updateVotingRound(id, {
      ...applyUpdate(input, ['description']),
      updated_at: new Date(),
    });
    if (!updated) {
      throw new Error(NotFoundErrorCode.VotingRoundNotFound);
    }
    return withAllFeatures(updated);
  },

  /**
   * Applies a status transition. Opening a round closes whichever round was
   * open before, so previous results stay untouched and readable.
   * Returns every round whose status changed.
   */
  setVotingRoundStatus: async (
    id: VotingRoundId,
    status: VotingRoundStatus
  ): Promise<VotingRoundWithFeatures[]> => {
    const round = await requireRound(id);
    if (round.status === status) {
      return [await withAllFeatures(round)];
    }

    const closedRounds =
      status === VotingRoundStatus.Open
        ? await featureVotingDomain.closeOpenRoundsExcept(id)
        : [];

    const updated = await featureVotingDomain.updateVotingRound(id, {
      status,
      updated_at: new Date(),
      ...(status === VotingRoundStatus.Open && { opened_at: new Date() }),
      ...(status === VotingRoundStatus.Closed && { closed_at: new Date() }),
    });
    if (!updated) {
      throw new Error(NotFoundErrorCode.VotingRoundNotFound);
    }

    return Promise.all(
      [updated, ...closedRounds].map((changed) => withAllFeatures(changed))
    );
  },

  deleteVotingRound: async (
    id: VotingRoundId
  ): Promise<VotingRoundWithFeatures> => {
    await requireRound(id);

    const voteCount = await featureVotingDomain.countVotesInRound(id);
    if (voteCount > 0) {
      throw new Error(ForbiddenErrorCode.DeleteVotingRoundBlockedByVotes);
    }

    const deleted = await featureVotingDomain.deleteVotingRound(id);
    if (!deleted) {
      throw new Error(NotFoundErrorCode.VotingRoundNotFound);
    }
    return { ...deleted, features: [] };
  },

  createVotableFeature: async (
    input: CreateVotableFeatureInput
  ): Promise<VotableFeatureWithVote> => {
    const round = await requireRound(input.voting_round_id);
    if (round.status === VotingRoundStatus.Closed) {
      throw new Error(ForbiddenErrorCode.VotingRoundClosed);
    }

    const created = await featureVotingDomain.insertVotableFeature({
      ...stripNulls(input),
      created_at: new Date(),
    });
    return { ...created, has_my_vote: false };
  },

  updateVotableFeature: async (
    id: VotableFeatureId,
    input: UpdateVotableFeatureInput
  ): Promise<VotableFeatureWithVote> => {
    const feature = await featureVotingDomain.loadVotableFeatureBy({ id });
    if (!feature) {
      throw new Error(NotFoundErrorCode.VotableFeatureNotFound);
    }

    const updated = await featureVotingDomain.updateVotableFeature(id, {
      ...applyUpdate(input, ['image_url']),
      updated_at: new Date(),
    });
    if (!updated) {
      throw new Error(NotFoundErrorCode.VotableFeatureNotFound);
    }

    const roundFeatures = await featureVotingDomain.loadVotableFeatures({
      roundId: updated.voting_round_id,
      userId: requestContext.get()?.user?.id,
    });
    return (
      roundFeatures.find((roundFeature) => roundFeature.id === updated.id) ?? {
        ...updated,
        has_my_vote: false,
      }
    );
  },

  /**
   * A feature that already collected votes is never removed, otherwise the
   * round results would silently change. Deactivate it instead.
   */
  deleteVotableFeature: async (
    id: VotableFeatureId
  ): Promise<VotableFeatureWithVote> => {
    const feature = await featureVotingDomain.loadVotableFeatureBy({ id });
    if (!feature) {
      throw new Error(NotFoundErrorCode.VotableFeatureNotFound);
    }

    const results = await featureVotingDomain.loadRoundResults(
      feature.voting_round_id
    );
    const featureResult = results.find((result) => result.id === id);
    if (featureResult && featureResult.vote_count > 0) {
      throw new Error(ForbiddenErrorCode.DeleteVotableFeatureBlockedByVotes);
    }

    const deleted = await featureVotingDomain.deleteVotableFeature(id);
    if (!deleted) {
      throw new Error(NotFoundErrorCode.VotableFeatureNotFound);
    }
    return { ...deleted, has_my_vote: false };
  },

  loadVotingRoundResults: async (
    id: VotingRoundId
  ): Promise<VotingRoundResults> => {
    const round = await requireRound(id);
    const [hydratedRound, rows, totalVoters] = await Promise.all([
      withAllFeatures(round),
      featureVotingDomain.loadRoundResults(id),
      featureVotingDomain.countVotersInRound(id),
    ]);

    return {
      round: hydratedRound,
      total_voters: totalVoters,
      results: rows.map(({ vote_count, ...feature }) => ({
        feature: { ...feature, has_my_vote: false },
        vote_count,
      })),
    };
  },
};
