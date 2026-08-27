import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestContextSimpleUserFiligran2 } from '../../../tests/tests.const';
import {
  FiligranProduct,
  VotingRoundStatus,
  VotingRoundTheme,
} from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import ServiceInstance, {
  ServiceInstanceId,
} from '../../model/kanel/public/ServiceInstance';
import VotableFeature, {
  VotableFeatureId,
} from '../../model/kanel/public/VotableFeature';
import VotingRound, {
  VotingRoundId,
} from '../../model/kanel/public/VotingRound';
import {
  BadRequestErrorCode,
  ForbiddenErrorCode,
  NotFoundErrorCode,
} from '../../utils/error/error.code';
import { ServiceInstanceDomain } from '../service/instance/service-instance.domain';
import { featureVotingApp } from './feature-voting.app';
import { featureVotingDomain } from './feature-voting.domain';

const ROUND_ID = uuidv4() as VotingRoundId;
const SERVICE_INSTANCE_ID = uuidv4() as ServiceInstanceId;

const buildRound = (overrides: Partial<VotingRound> = {}): VotingRound => ({
  id: ROUND_ID,
  service_instance_id: SERVICE_INSTANCE_ID,
  name: 'Feature vote #1',
  description: null,
  status: VotingRoundStatus.Open,
  theme: VotingRoundTheme.Default,
  opened_at: null,
  closed_at: null,
  creator_id: null,
  created_at: new Date(),
  updated_at: null,
  ...overrides,
});

const buildFeature = (
  overrides: Partial<VotableFeature> = {}
): VotableFeature => ({
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
  ...overrides,
});

describe('featureVotingApp.loadCurrentVotingRound', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(ServiceInstanceDomain, 'loadServiceInstanceBy').mockResolvedValue({
      id: SERVICE_INSTANCE_ID,
      public: true,
    } as ServiceInstance);
  });

  it('should return the round open on that service instance, with only its active features', async () => {
    // Given
    const round = buildRound({ status: VotingRoundStatus.Open });
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(round);
    const loadSpy = vi
      .spyOn(featureVotingDomain, 'loadVotableFeatures')
      .mockResolvedValue([]);

    // When
    const result =
      await featureVotingApp.loadCurrentVotingRound(SERVICE_INSTANCE_ID);

    // Then
    expect(featureVotingDomain.loadVotingRoundBy).toHaveBeenCalledWith({
      service_instance_id: SERVICE_INSTANCE_ID,
      status: VotingRoundStatus.Open,
    });
    expect(loadSpy).toHaveBeenCalledWith({
      roundId: ROUND_ID,
      product: undefined,
      onlyActive: true,
      userId: requestContextSimpleUserFiligran2.user.id,
    });
    expect(result).toMatchObject({ id: ROUND_ID, features: [] });
  });

  it('should return null when that service instance has no round collecting votes', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      undefined
    );

    // When
    const result =
      await featureVotingApp.loadCurrentVotingRound(SERVICE_INSTANCE_ID);

    // Then
    expect(result).toBeNull();
  });

  // The field is public, so a guessed service instance id must not leak the
  // roadmap of a private instance.
  it.each`
    serviceInstance                                | description
    ${{ id: SERVICE_INSTANCE_ID, public: false }}  | ${'a private service instance'}
    ${undefined}                                   | ${'a service instance that does not exist'}
  `(
    'should return null for $description without querying the rounds',
    async ({ serviceInstance }) => {
      // Given
      vi.spyOn(ServiceInstanceDomain, 'loadServiceInstanceBy').mockResolvedValue(
        serviceInstance as ServiceInstance | undefined
      );
      const loadRoundSpy = vi.spyOn(featureVotingDomain, 'loadVotingRoundBy');

      // When
      const result =
        await featureVotingApp.loadCurrentVotingRound(SERVICE_INSTANCE_ID);

      // Then
      expect(result).toBeNull();
      expect(loadRoundSpy).not.toHaveBeenCalled();
    }
  );
});

describe('admin reads of a voting round', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
  });

  // A deactivated feature that disappears from the admin screens can never be
  // reactivated, so the admin fields must list inactive features whatever the
  // status of the round — an open round included.
  it.each([
    VotingRoundStatus.Draft,
    VotingRoundStatus.Open,
    VotingRoundStatus.Closed,
  ])(
    'should expose inactive features of a %s round to the admin',
    async (status) => {
      // Given
      vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
        buildRound({ status })
      );
      const loadSpy = vi
        .spyOn(featureVotingDomain, 'loadVotableFeatures')
        .mockResolvedValue([]);

      // When
      await featureVotingApp.loadVotingRound(ROUND_ID);

      // Then
      expect(loadSpy).toHaveBeenCalledWith(
        expect.objectContaining({ onlyActive: false })
      );
    }
  );

  it('should expose inactive features in the admin round list', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotingRounds').mockResolvedValue([
      buildRound({ status: VotingRoundStatus.Open }),
    ]);
    const loadSpy = vi
      .spyOn(featureVotingDomain, 'loadVotableFeatures')
      .mockResolvedValue([]);

    // When
    await featureVotingApp.loadVotingRounds();

    // Then
    expect(loadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ onlyActive: false })
    );
  });

  it('should restrict the admin round list to a service instance when asked', async () => {
    // Given
    const listSpy = vi
      .spyOn(featureVotingDomain, 'loadVotingRounds')
      .mockResolvedValue([]);

    // When
    await featureVotingApp.loadVotingRounds(SERVICE_INSTANCE_ID);

    // Then
    expect(listSpy).toHaveBeenCalledWith(SERVICE_INSTANCE_ID);
  });

  it('should keep hiding inactive features from the public page', async () => {
    // Given
    vi.spyOn(ServiceInstanceDomain, 'loadServiceInstanceBy').mockResolvedValue({
      id: SERVICE_INSTANCE_ID,
      public: true,
    } as ServiceInstance);
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );
    const loadSpy = vi
      .spyOn(featureVotingDomain, 'loadVotableFeatures')
      .mockResolvedValue([]);

    // When
    await featureVotingApp.loadCurrentVotingRound(SERVICE_INSTANCE_ID);

    // Then
    expect(loadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ onlyActive: true })
    );
  });
});

describe('featureVotingApp.voteForFeature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
  });

  it('should record the vote against the round of the feature', async () => {
    // Given
    const feature = buildFeature({ product: FiligranProduct.Xtmhub });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );
    const upsertSpy = vi
      .spyOn(featureVotingDomain, 'upsertFeatureVote')
      .mockResolvedValue();
    const expected = [{ ...feature, has_my_vote: true }];
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue(
      expected
    );

    // When
    const result = await featureVotingApp.voteForFeature(feature.id);

    // Then
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: requestContextSimpleUserFiligran2.user.id,
        voting_round_id: ROUND_ID,
        votable_feature_id: feature.id,
        product: FiligranProduct.Xtmhub,
      })
    );
    expect(result).toEqual(expected);
  });

  it.each([VotingRoundStatus.Draft, VotingRoundStatus.Closed])(
    'should refuse to vote when the round is %s',
    async (status) => {
      // Given
      const feature = buildFeature();
      vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
        feature
      );
      vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
        buildRound({ status })
      );
      const upsertSpy = vi
        .spyOn(featureVotingDomain, 'upsertFeatureVote')
        .mockResolvedValue();

      // When / Then
      await expect(featureVotingApp.voteForFeature(feature.id)).rejects.toThrow(
        ForbiddenErrorCode.VotingRoundNotOpen
      );
      expect(upsertSpy).not.toHaveBeenCalled();
    }
  );

  it('should refuse to vote for an inactive feature', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      buildFeature({ active: false })
    );
    const upsertSpy = vi
      .spyOn(featureVotingDomain, 'upsertFeatureVote')
      .mockResolvedValue();

    // When / Then
    await expect(
      featureVotingApp.voteForFeature(uuidv4() as VotableFeatureId)
    ).rejects.toThrow(NotFoundErrorCode.VotableFeatureNotFound);
    expect(upsertSpy).not.toHaveBeenCalled();
  });
});

describe('featureVotingApp.createVotingRound', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(ServiceInstanceDomain, 'loadServiceInstanceBy').mockResolvedValue({
      id: SERVICE_INSTANCE_ID,
    } as ServiceInstance);
  });

  it('should refuse to create a round on a service instance that does not exist', async () => {
    // Given
    vi.spyOn(ServiceInstanceDomain, 'loadServiceInstanceBy').mockResolvedValue(
      undefined
    );
    const insertSpy = vi.spyOn(featureVotingDomain, 'insertVotingRound');

    // When / Then
    await expect(
      featureVotingApp.createVotingRound({
        service_instance_id: SERVICE_INSTANCE_ID,
        name: 'Feature vote #2',
      })
    ).rejects.toThrow(NotFoundErrorCode.ServiceInstanceNotFound);
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('should create the round as a draft attached to the service instance', async () => {
    // Given
    const insertSpy = vi
      .spyOn(featureVotingDomain, 'insertVotingRound')
      .mockResolvedValue(buildRound({ status: VotingRoundStatus.Draft }));
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([]);
    const copySpy = vi
      .spyOn(featureVotingDomain, 'insertVotableFeatures')
      .mockResolvedValue([]);

    // When
    await featureVotingApp.createVotingRound({
      service_instance_id: SERVICE_INSTANCE_ID,
      name: 'Feature vote #2',
    });

    // Then
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        service_instance_id: SERVICE_INSTANCE_ID,
        name: 'Feature vote #2',
        status: VotingRoundStatus.Draft,
        creator_id: requestContextSimpleUserFiligran2.user.id,
      })
    );
    expect(copySpy).not.toHaveBeenCalled();
  });

  it('should copy the features of the source round without copying its votes', async () => {
    // Given
    const sourceRoundId = uuidv4() as VotingRoundId;
    const newRound = buildRound({ id: uuidv4() as VotingRoundId });
    vi.spyOn(featureVotingDomain, 'insertVotingRound').mockResolvedValue(
      newRound
    );
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ id: sourceRoundId })
    );
    const sourceFeature = buildFeature({ voting_round_id: sourceRoundId });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([
      { ...sourceFeature, has_my_vote: true },
    ]);
    const copySpy = vi
      .spyOn(featureVotingDomain, 'insertVotableFeatures')
      .mockResolvedValue([]);

    // When
    await featureVotingApp.createVotingRound({
      service_instance_id: SERVICE_INSTANCE_ID,
      name: 'Feature vote #2',
      copy_features_from_round_id: sourceRoundId,
    });

    // Then
    expect(copySpy).toHaveBeenCalledWith([
      expect.objectContaining({
        voting_round_id: newRound.id,
        title: sourceFeature.title,
        product: sourceFeature.product,
      }),
    ]);
    expect(copySpy.mock.calls[0]?.[0][0]).not.toHaveProperty('has_my_vote');
  });
});

describe('featureVotingApp.setVotingRoundStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([]);
  });

  it('should close the previously open round when opening another one', async () => {
    // Given
    const previouslyOpen = buildRound({
      id: uuidv4() as VotingRoundId,
      status: VotingRoundStatus.Closed,
    });
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Draft })
    );
    const closeSpy = vi
      .spyOn(featureVotingDomain, 'closeOpenRoundsExcept')
      .mockResolvedValue([previouslyOpen]);
    vi.spyOn(featureVotingDomain, 'updateVotingRound').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );

    // When
    const result = await featureVotingApp.setVotingRoundStatus(
      ROUND_ID,
      VotingRoundStatus.Open
    );

    // Then: only the round open on the same service instance is closed
    expect(closeSpy).toHaveBeenCalledWith(ROUND_ID, SERVICE_INSTANCE_ID);
    expect(featureVotingDomain.updateVotingRound).toHaveBeenCalledWith(
      ROUND_ID,
      expect.objectContaining({
        status: VotingRoundStatus.Open,
        opened_at: expect.any(Date),
      })
    );
    expect(result.map(({ id }) => id)).toEqual([ROUND_ID, previouslyOpen.id]);
  });

  it('should stamp closed_at when closing a round', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );
    const closeSpy = vi.spyOn(featureVotingDomain, 'closeOpenRoundsExcept');
    vi.spyOn(featureVotingDomain, 'updateVotingRound').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Closed })
    );

    // When
    await featureVotingApp.setVotingRoundStatus(
      ROUND_ID,
      VotingRoundStatus.Closed
    );

    // Then
    expect(closeSpy).not.toHaveBeenCalled();
    expect(featureVotingDomain.updateVotingRound).toHaveBeenCalledWith(
      ROUND_ID,
      expect.objectContaining({
        status: VotingRoundStatus.Closed,
        closed_at: expect.any(Date),
      })
    );
  });

  it('should be a no-op when the round already has the target status', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );
    const updateSpy = vi.spyOn(featureVotingDomain, 'updateVotingRound');

    // When
    await featureVotingApp.setVotingRoundStatus(
      ROUND_ID,
      VotingRoundStatus.Open
    );

    // Then
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('featureVotingApp.deleteVotingRound', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound()
    );
  });

  it('should refuse to delete a round that already collected votes', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'countVotesInRound').mockResolvedValue(12);
    const deleteSpy = vi.spyOn(featureVotingDomain, 'deleteVotingRound');

    // When / Then
    await expect(featureVotingApp.deleteVotingRound(ROUND_ID)).rejects.toThrow(
      ForbiddenErrorCode.DeleteVotingRoundBlockedByVotes
    );
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('should delete a round without votes', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'countVotesInRound').mockResolvedValue(0);
    vi.spyOn(featureVotingDomain, 'deleteVotingRound').mockResolvedValue(
      buildRound()
    );

    // When
    const result = await featureVotingApp.deleteVotingRound(ROUND_ID);

    // Then
    expect(featureVotingDomain.deleteVotingRound).toHaveBeenCalledWith(
      ROUND_ID
    );
    expect(result).toMatchObject({ id: ROUND_ID, features: [] });
  });
});

describe('featureVotingApp.createVotableFeature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
  });

  it('should refuse to add a feature to a closed round', async () => {
    // Given
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Closed })
    );
    const insertSpy = vi.spyOn(featureVotingDomain, 'insertVotableFeature');

    // When / Then
    await expect(
      featureVotingApp.createVotableFeature({
        voting_round_id: ROUND_ID,
        title: 'New feature',
        short_description: 'Short',
        description: 'Long',
        product: FiligranProduct.Opencti,
      })
    ).rejects.toThrow(ForbiddenErrorCode.VotingRoundClosed);
    expect(insertSpy).not.toHaveBeenCalled();
  });
});

describe('featureVotingApp.updateVotableFeature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([]);
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Open })
    );
    vi.spyOn(featureVotingDomain, 'countVotesForFeature').mockResolvedValue(0);
  });

  // An explicit null is how the admin clears the illustration: it must reach
  // the database instead of being stripped away as an absent field.
  it('should clear the image when it is explicitly set to null', async () => {
    // Given
    const feature = buildFeature({ image_url: '/images/old.png' });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    const updateSpy = vi
      .spyOn(featureVotingDomain, 'updateVotableFeature')
      .mockResolvedValue({ ...feature, image_url: null });

    // When
    await featureVotingApp.updateVotableFeature(feature.id, {
      image_url: null,
    });

    // Then
    expect(updateSpy).toHaveBeenCalledWith(
      feature.id,
      expect.objectContaining({ image_url: null })
    );
  });

  it('should leave the image untouched when the field is absent', async () => {
    // Given
    const feature = buildFeature({ image_url: '/images/old.png' });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    const updateSpy = vi
      .spyOn(featureVotingDomain, 'updateVotableFeature')
      .mockResolvedValue(feature);

    // When
    await featureVotingApp.updateVotableFeature(feature.id, {
      title: 'Renamed',
    });

    // Then
    expect(updateSpy).toHaveBeenCalledWith(
      feature.id,
      expect.not.objectContaining({ image_url: expect.anything() })
    );
  });

  // The results of a closed round are published: editing a feature afterwards
  // would silently change what people voted on.
  it('should refuse to edit a feature of a closed round', async () => {
    // Given
    const feature = buildFeature();
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound({ status: VotingRoundStatus.Closed })
    );
    const updateSpy = vi.spyOn(featureVotingDomain, 'updateVotableFeature');

    // When / Then
    await expect(
      featureVotingApp.updateVotableFeature(feature.id, { title: 'Renamed' })
    ).rejects.toThrow(ForbiddenErrorCode.VotingRoundClosed);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  // One vote is allowed per user, per round and per product: moving a voted
  // feature to another product would let the same user weigh twice there.
  it('should refuse to move a feature that already collected votes to another product', async () => {
    // Given
    const feature = buildFeature({ product: FiligranProduct.Opencti });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'countVotesForFeature').mockResolvedValue(3);
    const updateSpy = vi.spyOn(featureVotingDomain, 'updateVotableFeature');

    // When / Then
    await expect(
      featureVotingApp.updateVotableFeature(feature.id, {
        product: FiligranProduct.Openaev,
      })
    ).rejects.toThrow(ForbiddenErrorCode.VotableFeatureProductLocked);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should still allow editing a voted feature as long as its product is unchanged', async () => {
    // Given
    const feature = buildFeature({ product: FiligranProduct.Opencti });
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'countVotesForFeature').mockResolvedValue(3);
    const updateSpy = vi
      .spyOn(featureVotingDomain, 'updateVotableFeature')
      .mockResolvedValue({ ...feature, title: 'Renamed' });

    // When
    await featureVotingApp.updateVotableFeature(feature.id, {
      title: 'Renamed',
      product: FiligranProduct.Opencti,
    });

    // Then
    expect(updateSpy).toHaveBeenCalledWith(
      feature.id,
      expect.objectContaining({ title: 'Renamed' })
    );
  });

  it('should refuse an image the public page could not render', async () => {
    // Given
    const feature = buildFeature();
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    const updateSpy = vi.spyOn(featureVotingDomain, 'updateVotableFeature');

    // When / Then
    await expect(
      featureVotingApp.updateVotableFeature(feature.id, {
        image_url: 'https://evil.example.com/pwn.png',
      })
    ).rejects.toThrow(BadRequestErrorCode.InvalidImageUrl);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('featureVotingApp.updateVotingRound', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([]);
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound()
    );
  });

  it('should clear the description when it is explicitly set to null', async () => {
    // Given
    const updateSpy = vi
      .spyOn(featureVotingDomain, 'updateVotingRound')
      .mockResolvedValue(buildRound({ description: null }));

    // When
    await featureVotingApp.updateVotingRound(ROUND_ID, { description: null });

    // Then
    expect(updateSpy).toHaveBeenCalledWith(
      ROUND_ID,
      expect.objectContaining({ description: null })
    );
  });
});

describe('featureVotingApp.deleteVotableFeature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
  });

  it('should refuse to delete a feature that already collected votes', async () => {
    // Given
    const feature = buildFeature();
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'countVotesForFeature').mockResolvedValue(3);
    const deleteSpy = vi.spyOn(featureVotingDomain, 'deleteVotableFeature');

    // When / Then
    await expect(
      featureVotingApp.deleteVotableFeature(feature.id)
    ).rejects.toThrow(ForbiddenErrorCode.DeleteVotableFeatureBlockedByVotes);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('should delete a feature without votes', async () => {
    // Given
    const feature = buildFeature();
    vi.spyOn(featureVotingDomain, 'loadVotableFeatureBy').mockResolvedValue(
      feature
    );
    vi.spyOn(featureVotingDomain, 'countVotesForFeature').mockResolvedValue(0);
    vi.spyOn(featureVotingDomain, 'deleteVotableFeature').mockResolvedValue(
      feature
    );

    // When
    const result = await featureVotingApp.deleteVotableFeature(feature.id);

    // Then
    expect(result).toMatchObject({ id: feature.id, has_my_vote: false });
  });
});

describe('featureVotingApp.loadVotingRoundResults', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    requestContext.set(requestContextSimpleUserFiligran2);
  });

  it('should return the ranking and the number of distinct voters', async () => {
    // Given
    const feature = buildFeature();
    vi.spyOn(featureVotingDomain, 'loadVotingRoundBy').mockResolvedValue(
      buildRound()
    );
    vi.spyOn(featureVotingDomain, 'loadVotableFeatures').mockResolvedValue([]);
    vi.spyOn(featureVotingDomain, 'loadRoundResults').mockResolvedValue([
      { ...feature, vote_count: 7 },
    ]);
    vi.spyOn(featureVotingDomain, 'countVotersInRound').mockResolvedValue(5);

    // When
    const result = await featureVotingApp.loadVotingRoundResults(ROUND_ID);

    // Then
    expect(result.total_voters).toBe(5);
    expect(result.results).toEqual([
      { feature: { ...feature, has_my_vote: false }, vote_count: 7 },
    ]);
  });
});
