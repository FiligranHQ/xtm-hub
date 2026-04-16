import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextSimpleUserFiligran2, INFO } from '../../../tests/tests.const';
import {
  AddUseCaseInput,
  OrderingMode,
  PageInfo,
  UseCaseConnection,
  UseCaseEdge,
  UseCaseOrdering,
} from '../../__generated__/resolvers-types';
import UseCase, { UseCaseId } from '../../model/kanel/public/UseCase';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';
import useCaseResolver from './use-case.resolver';

describe('query.useCases', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to useCaseDomain.loadUseCases and return result', async () => {
    // Given
    const opts = {
      first: 10,
      orderBy: UseCaseOrdering.Name,
      orderMode: OrderingMode.Asc,
    };
    const useCaseId = uuidv4() as UseCaseId;
    const edge: UseCaseEdge = {
      cursor: useCaseId,
      node: {
        id: useCaseId,
        name: 'Threat Hunting',
        color: '#ff0000',
      } as never,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: useCaseId,
      endCursor: useCaseId,
    };
    const expected: UseCaseConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(useCaseDomain, 'loadUseCases').mockReturnValue(expected as never);

    // When
    const result = await useCaseResolver.Query!.useCases!(
      {},
      opts,
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(useCaseDomain.loadUseCases).toHaveBeenCalledWith(opts);
    expect(result).toEqual(expected);
  });
});

describe('mutation.addUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to useCaseDomain.insertUseCase and return result', async () => {
    // Given
    const input: AddUseCaseInput = { name: 'Threat Hunting', color: '#ff0000' };
    const expected = {
      id: uuidv4(),
      name: 'Threat Hunting',
      color: '#ff0000',
    } as UseCase;
    vi.spyOn(useCaseDomain, 'insertUseCase').mockResolvedValue(expected);

    // When
    const result = await useCaseResolver.Mutation!.addUseCase!(
      {},
      { input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(useCaseDomain.insertUseCase).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({ name: 'Threat Hunting', color: '#ff0000' });
  });
});

describe('mutation.editUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to useCaseDomain.updateUseCase with typed id and return result', async () => {
    // Given
    const id = uuidv4() as UseCaseId;
    const input = { name: 'Updated Name', color: '#00ff00' };
    const expected = { id, name: 'Updated Name', color: '#00ff00' } as UseCase;
    vi.spyOn(useCaseDomain, 'updateUseCase').mockResolvedValue(expected);

    // When
    const result = await useCaseResolver.Mutation!.editUseCase!(
      {},
      { id, input },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(useCaseDomain.updateUseCase).toHaveBeenCalledWith(id, input);
    expect(result).toMatchObject({ id, name: 'Updated Name' });
  });
});

describe('mutation.deleteUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to useCaseApp.deleteUseCaseBy with typed id mutator and return result', async () => {
    // Given
    const id = uuidv4() as UseCaseId;
    const expected = { id, name: 'Deleted UseCase', color: '#000' } as UseCase;
    vi.spyOn(useCaseApp, 'deleteUseCaseBy').mockResolvedValue(expected);

    // When
    const result = await useCaseResolver.Mutation!.deleteUseCase!(
      {},
      { id },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(useCaseApp.deleteUseCaseBy).toHaveBeenCalledWith({ id });
    expect(result).toMatchObject({ id });
  });
});
