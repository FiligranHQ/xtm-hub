import { db, dbRaw } from '../../../knexfile';
import {
  FiligranProduct,
  VotingRoundStatus,
} from '../../__generated__/resolvers-types';
import FeatureVote, {
  FeatureVoteInitializer,
} from '../../model/kanel/public/FeatureVote';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { UserId } from '../../model/kanel/public/User';
import VotableFeature, {
  VotableFeatureId,
  VotableFeatureInitializer,
  VotableFeatureMutator,
} from '../../model/kanel/public/VotableFeature';
import VotingRound, {
  VotingRoundId,
  VotingRoundInitializer,
  VotingRoundMutator,
} from '../../model/kanel/public/VotingRound';
import { UnknownErrorCode } from '../../utils/error/error.code';

export type VotableFeatureWithVote = VotableFeature & {
  has_my_vote: boolean;
};

export type VotableFeatureWithCount = VotableFeature & {
  vote_count: number;
};

export const featureVotingDomain = {
  loadVotingRounds: (
    serviceInstanceId?: ServiceInstanceId | null
  ): Promise<VotingRound[]> =>
    db<VotingRound>('VotingRound')
      .modify((queryBuilder) => {
        if (serviceInstanceId) {
          queryBuilder.where({ service_instance_id: serviceInstanceId });
        }
      })
      .orderBy('created_at', 'desc')
      .select<VotingRound[]>('*'),

  loadVotingRoundBy: (
    field: VotingRoundMutator
  ): Promise<VotingRound | undefined> =>
    db<VotingRound>('VotingRound').where(field).first(),

  insertVotingRound: async (
    input: VotingRoundInitializer
  ): Promise<VotingRound> => {
    const [round] = await db<VotingRound>('VotingRound')
      .insert(input)
      .returning('*');
    if (!round) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return round;
  },

  updateVotingRound: async (
    id: VotingRoundId,
    fields: VotingRoundMutator
  ): Promise<VotingRound | undefined> => {
    const [round] = await db<VotingRound>('VotingRound')
      .where({ id })
      .update(fields)
      .returning('*');
    return round;
  },

  /**
   * Closes the round left open on the same service instance, except the one
   * being opened. Keeps the "single open round per service instance" database
   * index satisfiable when switching rounds, without touching other roadmaps.
   */
  closeOpenRoundsExcept: async (
    id: VotingRoundId,
    serviceInstanceId: ServiceInstanceId
  ): Promise<VotingRound[]> =>
    db<VotingRound>('VotingRound')
      .where({
        status: VotingRoundStatus.Open,
        service_instance_id: serviceInstanceId,
      })
      .whereNot({ id })
      .update({ status: VotingRoundStatus.Closed, closed_at: new Date() })
      .returning('*'),

  deleteVotingRound: async (
    id: VotingRoundId
  ): Promise<VotingRound | undefined> => {
    const [deleted] = await db<VotingRound>('VotingRound')
      .where({ id })
      .delete('*');
    return deleted;
  },

  loadVotableFeatures: async (opts: {
    roundId: VotingRoundId;
    product?: FiligranProduct | null;
    userId?: UserId;
    onlyActive?: boolean;
  }): Promise<VotableFeatureWithVote[]> => {
    return db<VotableFeature>('VotableFeature')
      .where('VotableFeature.voting_round_id', opts.roundId)
      .modify((queryBuilder) => {
        if (opts.onlyActive) {
          queryBuilder.andWhere('VotableFeature.active', true);
        }
        if (opts.product) {
          queryBuilder.andWhere('VotableFeature.product', opts.product);
        }
      })
      .orderBy([
        { column: 'VotableFeature.product', order: 'asc' },
        { column: 'VotableFeature.position', order: 'asc' },
      ])
      .select<VotableFeatureWithVote[]>(
        'VotableFeature.*',
        opts.userId
          ? dbRaw(
              'EXISTS(SELECT 1 FROM "FeatureVote" WHERE "FeatureVote"."votable_feature_id" = "VotableFeature"."id" AND "FeatureVote"."user_id" = ?) as has_my_vote',
              [opts.userId]
            )
          : dbRaw('false as has_my_vote')
      );
  },

  loadVotableFeatureBy: (
    field: VotableFeatureMutator
  ): Promise<VotableFeature | undefined> =>
    db<VotableFeature>('VotableFeature').where(field).first(),

  insertVotableFeature: async (
    input: VotableFeatureInitializer
  ): Promise<VotableFeature> => {
    const [feature] = await db<VotableFeature>('VotableFeature')
      .insert(input)
      .returning('*');
    if (!feature) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return feature;
  },

  insertVotableFeatures: async (
    inputs: VotableFeatureInitializer[]
  ): Promise<VotableFeature[]> => {
    if (inputs.length === 0) {
      return [];
    }
    return db<VotableFeature>('VotableFeature').insert(inputs).returning('*');
  },

  updateVotableFeature: async (
    id: VotableFeatureId,
    fields: VotableFeatureMutator
  ): Promise<VotableFeature | undefined> => {
    const [feature] = await db<VotableFeature>('VotableFeature')
      .where({ id })
      .update(fields)
      .returning('*');
    return feature;
  },

  deleteVotableFeature: async (
    id: VotableFeatureId
  ): Promise<VotableFeature | undefined> => {
    const [deleted] = await db<VotableFeature>('VotableFeature')
      .where({ id })
      .delete('*');
    return deleted;
  },

  upsertFeatureVote: async (input: FeatureVoteInitializer): Promise<void> => {
    await db<FeatureVote>('FeatureVote')
      .insert(input)
      .onConflict(['user_id', 'voting_round_id', 'product'])
      .merge(['votable_feature_id', 'created_at']);
  },

  countVotesInRound: async (roundId: VotingRoundId): Promise<number> => {
    const row = await db<FeatureVote>('FeatureVote')
      .where({ voting_round_id: roundId })
      .count<{ count: string | number }>({ count: '*' })
      .first();
    return Number(row?.count ?? 0);
  },

  countVotersInRound: async (roundId: VotingRoundId): Promise<number> => {
    const row = await db<FeatureVote>('FeatureVote')
      .where({ voting_round_id: roundId })
      .countDistinct<{ count: string | number }>({ count: 'user_id' })
      .first();
    return Number(row?.count ?? 0);
  },

  countVotesForFeature: async (
    featureId: VotableFeatureId
  ): Promise<number> => {
    const row = await db<FeatureVote>('FeatureVote')
      .where({ votable_feature_id: featureId })
      .count<{ count: string | number }>({ count: '*' })
      .first();
    return Number(row?.count ?? 0);
  },

  loadRoundResults: async (
    roundId: VotingRoundId
  ): Promise<VotableFeatureWithCount[]> => {
    const rows = (await db<VotableFeature>('VotableFeature')
      .leftJoin(
        'FeatureVote',
        'FeatureVote.votable_feature_id',
        'VotableFeature.id'
      )
      .where('VotableFeature.voting_round_id', roundId)
      .groupBy('VotableFeature.id')
      .select('VotableFeature.*')
      .count({ vote_count: 'FeatureVote.user_id' })
      .orderBy([
        { column: 'vote_count', order: 'desc' },
        { column: 'VotableFeature.product', order: 'asc' },
        { column: 'VotableFeature.position', order: 'asc' },
      ])) as unknown as (VotableFeature & { vote_count: string | number })[];

    return rows.map((row) => ({
      ...row,
      vote_count: Number(row.vote_count ?? 0),
    }));
  },
};
