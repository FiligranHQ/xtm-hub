import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FiligranProduct,
  VotingRoundStatus,
} from '../../__generated__/resolvers-types';
import { UserId } from '../../model/kanel/public/User';
import { VotableFeatureId } from '../../model/kanel/public/VotableFeature';
import { VotingRoundId } from '../../model/kanel/public/VotingRound';
import { featureVotingDomain } from './feature-voting.domain';

vi.mock('../../../knexfile', () => ({
  db: vi.fn(),
  dbRaw: vi.fn((sql: string, bindings?: unknown[]) => ({ sql, bindings })),
}));

import { db, dbRaw } from '../../../knexfile';

const ROUND_ID = uuidv4() as VotingRoundId;

describe('feature-voting.domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadVotableFeatures', () => {
    const buildQueryMock = () => {
      const selectMock = vi.fn().mockResolvedValue([]);
      const orderByMock = vi.fn().mockReturnValue({ select: selectMock });
      const andWhereMock = vi.fn();
      const modifyMock = vi
        .fn()
        .mockImplementation(
          (
            callback: (queryBuilder: { andWhere: typeof andWhereMock }) => void
          ) => {
            callback({ andWhere: andWhereMock });
            return { orderBy: orderByMock };
          }
        );
      const whereMock = vi.fn().mockReturnValue({ modify: modifyMock });
      vi.mocked(db).mockReturnValue({
        where: whereMock,
      } as unknown as ReturnType<typeof db>);
      return { whereMock, andWhereMock, orderByMock, selectMock };
    };

    it('should scope features to the round and filter by product when provided', async () => {
      // Given
      const { whereMock, andWhereMock } = buildQueryMock();

      // When
      await featureVotingDomain.loadVotableFeatures({
        roundId: ROUND_ID,
        product: FiligranProduct.Opencti,
      });

      // Then
      expect(db).toHaveBeenCalledWith('VotableFeature');
      expect(whereMock).toHaveBeenCalledWith(
        'VotableFeature.voting_round_id',
        ROUND_ID
      );
      expect(andWhereMock).toHaveBeenCalledWith(
        'VotableFeature.product',
        FiligranProduct.Opencti
      );
    });

    it('should restrict to active features only when asked', async () => {
      // Given
      const { andWhereMock } = buildQueryMock();

      // When
      await featureVotingDomain.loadVotableFeatures({
        roundId: ROUND_ID,
        onlyActive: true,
      });

      // Then
      expect(andWhereMock).toHaveBeenCalledWith('VotableFeature.active', true);
    });

    it('should include inactive features by default', async () => {
      // Given
      const { andWhereMock } = buildQueryMock();

      // When
      await featureVotingDomain.loadVotableFeatures({ roundId: ROUND_ID });

      // Then
      expect(andWhereMock).not.toHaveBeenCalledWith(
        'VotableFeature.active',
        true
      );
    });

    it('should compute has_my_vote with the user id when provided', async () => {
      // Given
      buildQueryMock();
      const userId = uuidv4() as UserId;

      // When
      await featureVotingDomain.loadVotableFeatures({
        roundId: ROUND_ID,
        userId,
      });

      // Then
      expect(dbRaw).toHaveBeenCalledWith(expect.stringContaining('EXISTS'), [
        userId,
      ]);
    });

    it('should select has_my_vote as false when no user is provided', async () => {
      // Given
      buildQueryMock();

      // When
      await featureVotingDomain.loadVotableFeatures({ roundId: ROUND_ID });

      // Then
      expect(dbRaw).toHaveBeenCalledWith('false as has_my_vote');
    });
  });

  describe('upsertFeatureVote', () => {
    it('should replace the previous vote of the user for that product and round', async () => {
      // Given
      const mergeMock = vi.fn().mockResolvedValue(undefined);
      const onConflictMock = vi.fn().mockReturnValue({ merge: mergeMock });
      const insertMock = vi
        .fn()
        .mockReturnValue({ onConflict: onConflictMock });
      vi.mocked(db).mockReturnValue({
        insert: insertMock,
      } as unknown as ReturnType<typeof db>);
      const input = {
        user_id: uuidv4() as UserId,
        voting_round_id: ROUND_ID,
        votable_feature_id: uuidv4() as VotableFeatureId,
        product: FiligranProduct.Openaev,
        created_at: new Date(),
      };

      // When
      await featureVotingDomain.upsertFeatureVote(input);

      // Then
      expect(db).toHaveBeenCalledWith('FeatureVote');
      expect(insertMock).toHaveBeenCalledWith(input);
      expect(onConflictMock).toHaveBeenCalledWith([
        'user_id',
        'voting_round_id',
        'product',
      ]);
      expect(mergeMock).toHaveBeenCalledWith([
        'votable_feature_id',
        'created_at',
      ]);
    });
  });

  describe('closeOpenRoundsExcept', () => {
    it('should close every other open round', async () => {
      // Given
      const returningMock = vi.fn().mockResolvedValue([]);
      const updateMock = vi.fn().mockReturnValue({ returning: returningMock });
      const whereNotMock = vi.fn().mockReturnValue({ update: updateMock });
      const whereMock = vi.fn().mockReturnValue({ whereNot: whereNotMock });
      vi.mocked(db).mockReturnValue({
        where: whereMock,
      } as unknown as ReturnType<typeof db>);

      // When
      await featureVotingDomain.closeOpenRoundsExcept(ROUND_ID);

      // Then
      expect(db).toHaveBeenCalledWith('VotingRound');
      expect(whereMock).toHaveBeenCalledWith({
        status: VotingRoundStatus.Open,
      });
      expect(whereNotMock).toHaveBeenCalledWith({ id: ROUND_ID });
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: VotingRoundStatus.Closed,
          closed_at: expect.any(Date),
        })
      );
    });
  });

  describe('loadRoundResults', () => {
    it('should count votes per feature of the round and normalize the counts', async () => {
      // Given
      const featureId = uuidv4() as VotableFeatureId;
      const orderByMock = vi
        .fn()
        .mockResolvedValue([{ id: featureId, vote_count: '4' }]);
      const countMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const selectMock = vi.fn().mockReturnValue({ count: countMock });
      const groupByMock = vi.fn().mockReturnValue({ select: selectMock });
      const whereMock = vi.fn().mockReturnValue({ groupBy: groupByMock });
      const leftJoinMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db).mockReturnValue({
        leftJoin: leftJoinMock,
      } as unknown as ReturnType<typeof db>);

      // When
      const result = await featureVotingDomain.loadRoundResults(ROUND_ID);

      // Then
      expect(db).toHaveBeenCalledWith('VotableFeature');
      expect(leftJoinMock).toHaveBeenCalledWith(
        'FeatureVote',
        'FeatureVote.votable_feature_id',
        'VotableFeature.id'
      );
      expect(whereMock).toHaveBeenCalledWith(
        'VotableFeature.voting_round_id',
        ROUND_ID
      );
      expect(groupByMock).toHaveBeenCalledWith('VotableFeature.id');
      expect(countMock).toHaveBeenCalledWith({
        vote_count: 'FeatureVote.user_id',
      });
      expect(result).toEqual([{ id: featureId, vote_count: 4 }]);
    });
  });

  describe('countVotersInRound', () => {
    it('should count distinct voters of the round', async () => {
      // Given
      const firstMock = vi.fn().mockResolvedValue({ count: '9' });
      const countDistinctMock = vi.fn().mockReturnValue({ first: firstMock });
      const whereMock = vi
        .fn()
        .mockReturnValue({ countDistinct: countDistinctMock });
      vi.mocked(db).mockReturnValue({
        where: whereMock,
      } as unknown as ReturnType<typeof db>);

      // When
      const result = await featureVotingDomain.countVotersInRound(ROUND_ID);

      // Then
      expect(db).toHaveBeenCalledWith('FeatureVote');
      expect(whereMock).toHaveBeenCalledWith({ voting_round_id: ROUND_ID });
      expect(countDistinctMock).toHaveBeenCalledWith({ count: 'user_id' });
      expect(result).toBe(9);
    });
  });
});
