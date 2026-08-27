import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
} from '../../../tests/tests.const';
import {
  FiligranProduct,
  VotingRoundStatus,
  VotingRoundTheme,
} from '../../__generated__/resolvers-types';
import { VotableFeatureId } from '../../model/kanel/public/VotableFeature';
import { VotingRoundId } from '../../model/kanel/public/VotingRound';
import {
  featureVotingApp,
  VotingRoundWithFeatures,
} from './feature-voting.app';
import { VotableFeatureWithVote } from './feature-voting.domain';
import featureVotingResolver from './feature-voting.resolver';

const ROUND_ID = uuidv4() as VotingRoundId;

const buildFeature = (
  overrides: Partial<VotableFeatureWithVote> = {}
): VotableFeatureWithVote => ({
  id: uuidv4() as VotableFeatureId,
  voting_round_id: ROUND_ID,
  title: 'AI-powered report triage',
  short_description: 'Automatically extract entities from reports.',
  description: 'Leverage AI to ingest unstructured threat reports.',
  product: FiligranProduct.Opencti,
  labels: ['AI', 'Import'],
  image_url: null,
  position: 1,
  active: true,
  created_at: new Date(),
  updated_at: null,
  has_my_vote: false,
  ...overrides,
});

const buildRound = (
  overrides: Partial<VotingRoundWithFeatures> = {}
): VotingRoundWithFeatures => ({
  id: ROUND_ID,
  name: 'Feature vote #1',
  description: null,
  status: VotingRoundStatus.Open,
  theme: VotingRoundTheme.Default,
  opened_at: null,
  closed_at: null,
  creator_id: null,
  created_at: new Date(),
  updated_at: null,
  features: [],
  ...overrides,
});

describe('currentVotingRound GraphQL query', () => {
  it('should delegate to featureVotingApp.loadCurrentVotingRound', async () => {
    // Given
    const expected = buildRound();
    vi.spyOn(featureVotingApp, 'loadCurrentVotingRound').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Query!.currentVotingRound!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.loadCurrentVotingRound).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
});

describe('votingRounds GraphQL query', () => {
  it('should delegate to featureVotingApp.loadVotingRounds', async () => {
    // Given
    const expected = [buildRound()];
    vi.spyOn(featureVotingApp, 'loadVotingRounds').mockResolvedValue(expected);

    // When
    const result = await featureVotingResolver.Query!.votingRounds!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(result).toEqual(expected);
  });
});

describe('votingRoundResults GraphQL query', () => {
  it('should delegate to featureVotingApp.loadVotingRoundResults with the round id', async () => {
    // Given
    const expected = {
      round: buildRound(),
      total_voters: 4,
      results: [{ feature: buildFeature(), vote_count: 4 }],
    };
    vi.spyOn(featureVotingApp, 'loadVotingRoundResults').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Query!.votingRoundResults!(
      {},
      { id: ROUND_ID },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.loadVotingRoundResults).toHaveBeenCalledWith(
      ROUND_ID
    );
    expect(result).toEqual(expected);
  });
});

describe('voteForFeature GraphQL mutation', () => {
  it('should delegate to featureVotingApp.voteForFeature and return the round features', async () => {
    // Given
    const featureId = uuidv4() as VotableFeatureId;
    const expected = [buildFeature({ id: featureId, has_my_vote: true })];
    vi.spyOn(featureVotingApp, 'voteForFeature').mockResolvedValue(expected);

    // When
    const result = await featureVotingResolver.Mutation!.voteForFeature!(
      {},
      { feature_id: featureId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.voteForFeature).toHaveBeenCalledWith(featureId);
    expect(result).toEqual(expected);
  });
});

describe('voting round admin GraphQL mutations', () => {
  it('should delegate createVotingRound to the app layer', async () => {
    // Given
    const input = { name: 'Feature vote #2' };
    const expected = buildRound();
    vi.spyOn(featureVotingApp, 'createVotingRound').mockResolvedValue(expected);

    // When
    const result = await featureVotingResolver.Mutation!.createVotingRound!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.createVotingRound).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });

  it('should delegate setVotingRoundStatus to the app layer', async () => {
    // Given
    const expected = [buildRound({ status: VotingRoundStatus.Open })];
    vi.spyOn(featureVotingApp, 'setVotingRoundStatus').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Mutation!.setVotingRoundStatus!(
      {},
      { id: ROUND_ID, status: VotingRoundStatus.Open },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.setVotingRoundStatus).toHaveBeenCalledWith(
      ROUND_ID,
      VotingRoundStatus.Open
    );
    expect(result).toEqual(expected);
  });

  it('should delegate deleteVotingRound to the app layer', async () => {
    // Given
    const expected = buildRound();
    vi.spyOn(featureVotingApp, 'deleteVotingRound').mockResolvedValue(expected);

    // When
    const result = await featureVotingResolver.Mutation!.deleteVotingRound!(
      {},
      { id: ROUND_ID },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.deleteVotingRound).toHaveBeenCalledWith(ROUND_ID);
    expect(result).toEqual(expected);
  });
});

describe('votable feature admin GraphQL mutations', () => {
  it('should delegate createVotableFeature to the app layer', async () => {
    // Given
    const input = {
      voting_round_id: ROUND_ID,
      title: 'New feature',
      short_description: 'Short',
      description: 'Long',
      product: FiligranProduct.Opencti,
    };
    const expected = buildFeature();
    vi.spyOn(featureVotingApp, 'createVotableFeature').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Mutation!.createVotableFeature!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.createVotableFeature).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });

  it('should delegate updateVotableFeature to the app layer', async () => {
    // Given
    const featureId = uuidv4() as VotableFeatureId;
    const input = { title: 'Renamed feature' };
    const expected = buildFeature({ id: featureId, title: 'Renamed feature' });
    vi.spyOn(featureVotingApp, 'updateVotableFeature').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Mutation!.updateVotableFeature!(
      {},
      { id: featureId, input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.updateVotableFeature).toHaveBeenCalledWith(
      featureId,
      input
    );
    expect(result).toMatchObject({ title: 'Renamed feature' });
  });

  it('should delegate deleteVotableFeature to the app layer', async () => {
    // Given
    const featureId = uuidv4() as VotableFeatureId;
    const expected = buildFeature({ id: featureId });
    vi.spyOn(featureVotingApp, 'deleteVotableFeature').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingResolver.Mutation!.deleteVotableFeature!(
      {},
      { id: featureId },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(featureVotingApp.deleteVotableFeature).toHaveBeenCalledWith(
      featureId
    );
    expect(result).toEqual(expected);
  });
});
