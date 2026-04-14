import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  INFO,
} from '../../../../tests/tests.const';
import {
  Competitor,
  CompetitorConnection,
  CompetitorEdge,
  CompetitorOrdering,
  CompetitorTier,
  CreateCompetitorInput,
  OrderingMode,
  PageInfo,
  UpdateCompetitorInput,
} from '../../../__generated__/resolvers-types';
import { CompetitorId } from '../../../model/kanel/public/Competitor';
import { ErrorType } from '../../../utils/error/error.type';
import { CompetitorApp } from './competitor.app';
import { CompetitorDomain } from './competitor.domain';
import competitorResolver from './competitor.resolver';

describe('Query.competitors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to CompetitorDomain.loadCompetitors and return result', async () => {
    // Given
    const args = {
      first: 10,
      after: null,
      orderMode: OrderingMode.Asc,
      orderBy: CompetitorOrdering.Name,
    };
    const competitorId = uuidv4() as CompetitorId;
    const competitor: Competitor = {
      id: competitorId,
      name: 'Acme Corp',
      domain: 'acme.com',
      tier: CompetitorTier.Tier1,
    };
    const edge: CompetitorEdge = {
      cursor: competitorId,
      node: competitor,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: competitorId,
      endCursor: competitorId,
    };
    const expected: CompetitorConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(CompetitorDomain, 'loadCompetitors').mockResolvedValue(expected);

    // When
    const result = await competitorResolver.Query!.competitors!(
      {},
      args,
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(CompetitorDomain.loadCompetitors).toHaveBeenCalledWith(args);
    expect(result).toEqual(expected);
  });

  it('should throw mapped error when CompetitorDomain throws', async () => {
    // Given
    vi.spyOn(CompetitorDomain, 'loadCompetitors').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = competitorResolver.Query!.competitors!(
      {},
      {
        first: 10,
        orderMode: OrderingMode.Asc,
        orderBy: CompetitorOrdering.Name,
      },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});

describe('Mutation.createCompetitor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to CompetitorApp.insertCompetitor and return created competitor', async () => {
    // Given
    const input: CreateCompetitorInput = {
      name: 'Acme Corp',
      domain: 'acme.com',
      tier: CompetitorTier.Tier1,
    };
    const expected = {
      id: uuidv4() as CompetitorId,
      name: 'Acme Corp',
      domain: 'acme.com',
      tier: CompetitorTier.Tier1,
    } as unknown as Competitor;
    vi.spyOn(CompetitorApp, 'insertCompetitor').mockResolvedValue(expected);

    // When
    const result = await competitorResolver.Mutation!.createCompetitor!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(CompetitorApp.insertCompetitor).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({ name: 'Acme Corp', domain: 'acme.com' });
  });

  it('should throw mapped error when CompetitorApp throws', async () => {
    // Given
    const input: CreateCompetitorInput = {
      name: 'Acme Corp',
      domain: 'acme.com',
      tier: CompetitorTier.Tier1,
    };
    vi.spyOn(CompetitorApp, 'insertCompetitor').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = competitorResolver.Mutation!.createCompetitor!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});

describe('Mutation.updateCompetitor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to CompetitorApp.updateCompetitorById and return updated competitor', async () => {
    // Given
    const input: UpdateCompetitorInput = {
      id: uuidv4() as CompetitorId,
      name: 'Updated Corp',
      domain: 'updated.com',
    };
    const expected = {
      ...input,
      tier: CompetitorTier.Tier2,
    } as unknown as Competitor;
    vi.spyOn(CompetitorApp, 'updateCompetitorById').mockResolvedValue(expected);

    // When
    const result = await competitorResolver.Mutation!.updateCompetitor!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(CompetitorApp.updateCompetitorById).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({
      name: 'Updated Corp',
      domain: 'updated.com',
    });
  });

  it('should throw mapped error when CompetitorApp throws', async () => {
    // Given
    const input: UpdateCompetitorInput = {
      id: uuidv4() as CompetitorId,
      name: 'Updated Corp',
    };
    vi.spyOn(CompetitorApp, 'updateCompetitorById').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = competitorResolver.Mutation!.updateCompetitor!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});

describe('Mutation.deleteCompetitor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to CompetitorApp.deleteCompetitorById and return deleted competitor', async () => {
    // Given
    const id = uuidv4() as CompetitorId;
    const expected = {
      id,
      name: 'Deleted Corp',
      domain: 'deleted.com',
      tier: CompetitorTier.Tier1,
    } as unknown as Competitor;
    vi.spyOn(CompetitorApp, 'deleteCompetitorById').mockResolvedValue(expected);

    // When
    const result = await competitorResolver.Mutation!.deleteCompetitor!(
      {},
      { id },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(CompetitorApp.deleteCompetitorById).toHaveBeenCalledWith(id);
    expect(result).toMatchObject({ id, name: 'Deleted Corp' });
  });

  it('should throw mapped error when CompetitorApp throws', async () => {
    // Given
    const id = uuidv4() as CompetitorId;
    vi.spyOn(CompetitorApp, 'deleteCompetitorById').mockRejectedValue(
      new Error('UNEXPECTED')
    );

    // When
    const call = competitorResolver.Mutation!.deleteCompetitor!(
      {},
      { id },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.UnknownError });
  });
});
