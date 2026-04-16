import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contextSimpleUserFiligran2, INFO } from '../../../tests/tests.const';
import {
  CreateEpicInput,
  EpicConnection,
  EpicEdge,
  EpicOrdering,
  EpicType,
  FiligranProduct,
  OrderingMode,
  PageInfo,
  Timeline,
  UpdateEpicInput,
} from '../../__generated__/resolvers-types';
import { DocumentId } from '../../model/kanel/public/Document';
import Epic, { EpicId } from '../../model/kanel/public/Epic';
import { BadRequestErrorCode } from '../../utils/error/error.code';
import { ErrorType } from '../../utils/error/error.type';
import { DocumentDomain } from '../document/domain/document.domain';
import { EpicApp } from './epic.app';
import epicResolver from './epic.resolver';

describe('epic.document', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load document by document_id and return first result', async () => {
    // Given
    const documentId = uuidv4() as DocumentId;
    const epicParent = {
      id: uuidv4() as EpicId,
      document_id: documentId,
    } as unknown as never;
    const expectedDocument = { id: documentId, file_name: 'image.png' };
    vi.spyOn(DocumentDomain, 'loadDocumentBy').mockResolvedValue([
      expectedDocument,
    ] as never);

    // When
    const result = await epicResolver.Epic!.document!(
      epicParent,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(DocumentDomain.loadDocumentBy).toHaveBeenCalledWith({
      id: documentId,
    });
    expect(result).toMatchObject({ id: documentId, file_name: 'image.png' });
  });

  it('should return null when document_id is not set', async () => {
    // Given
    const epicParent = {
      id: uuidv4() as EpicId,
      document_id: null,
    } as unknown as never;

    // When
    const result = await epicResolver.Epic!.document!(
      epicParent,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(result).toBeNull();
  });

  it('should return null when DocumentDomain returns an empty array', async () => {
    // Given
    const documentId = uuidv4() as DocumentId;
    const epicParent = {
      id: uuidv4() as EpicId,
      document_id: documentId,
    } as unknown as never;
    vi.spyOn(DocumentDomain, 'loadDocumentBy').mockResolvedValue([] as never);

    // When
    const result = await epicResolver.Epic!.document!(
      epicParent,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(result).toBeNull();
  });
});

describe('epic.document_id', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return global ID when document_id is set', () => {
    // Given
    const rawDocumentId = uuidv4() as DocumentId;
    const epicParent = {
      id: uuidv4() as EpicId,
      document_id: rawDocumentId,
    } as unknown as never;

    // When
    const result = epicResolver.Epic!.document_id!(
      epicParent,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(result).toBe(toGlobalId('Document', rawDocumentId));
  });

  it('should return undefined when document_id is null', () => {
    // Given
    const epicParent = {
      id: uuidv4() as EpicId,
      document_id: null,
    } as unknown as never;

    // When
    const result = epicResolver.Epic!.document_id!(
      epicParent,
      {},
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(result).toBeUndefined();
  });
});

describe('query.epics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to EpicApp.loadEpics and return result', async () => {
    // Given
    const opts = {
      first: 10,
      orderBy: EpicOrdering.Title,
      orderMode: OrderingMode.Asc,
    };
    const epicId = uuidv4() as EpicId;
    const epic: Epic = {
      id: epicId,
      epic: 'my-epic',
      title: 'My Epic',
      active: true,
      short_description: 'A short description',
      description: 'A longer description',
      product: FiligranProduct.Opencti,
      timeline: Timeline.Now,
      epic_type: EpicType.Other,
      uploader_id: 'uploader-1',
      document_id: null,
      created_at: new Date('2026-01-01'),
      updated_at: null,
      updater_id: null,
    };
    const edge: EpicEdge = {
      cursor: epicId,
      node: epic as never,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: epicId,
      endCursor: epicId,
    };
    const expected: EpicConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(EpicApp, 'loadEpics').mockResolvedValue(expected);

    // When
    const result = await epicResolver.Query!.epics!(
      {},
      opts,
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(EpicApp.loadEpics).toHaveBeenCalledWith(opts);
    expect(result).toEqual(expected);
  });
});

describe('mutation.createEpic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to EpicApp.createEpic and return created epic', async () => {
    // Given
    const input: CreateEpicInput = {
      title: 'My Epic',
      short_description: 'A short description',
      description: 'A longer description',
      product: FiligranProduct.Opencti,
      timeline: Timeline.Now,
    };
    const uploads: never[] = [];
    const expected = {
      id: uuidv4() as EpicId,
      title: 'My Epic',
      epic_type: EpicType.Other,
    } as Epic;
    vi.spyOn(EpicApp, 'createEpic').mockResolvedValue(expected);

    // When
    const result = await epicResolver.Mutation!.createEpic!(
      {},
      { input, document: uploads },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(EpicApp.createEpic).toHaveBeenCalledWith(input, uploads);
    expect(result).toMatchObject({ title: 'My Epic' });
  });

  it('should map to BadRequest for InvalidImageUrl error', async () => {
    // Given
    const input: CreateEpicInput = {
      title: 'My Epic',
      short_description: 'Short',
      description: 'Long',
      product: FiligranProduct.Opencti,
      timeline: Timeline.Now,
    };
    vi.spyOn(EpicApp, 'createEpic').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidImageUrl)
    );

    // When
    const call = epicResolver.Mutation!.createEpic!(
      {},
      { input, document: [] },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('mutation.updateEpic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to EpicApp.updateEpic with typed id and return updated epic', async () => {
    // Given
    const id = uuidv4() as EpicId;
    const input: UpdateEpicInput = {
      title: 'Updated Epic',
      short_description: 'Updated',
    };
    const uploads: never[] = [];
    const expected = { id, title: 'Updated Epic' } as Epic;
    vi.spyOn(EpicApp, 'updateEpic').mockResolvedValue(expected);

    // When
    const result = await epicResolver.Mutation!.updateEpic!(
      {},
      { id, input, document: uploads },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(EpicApp.updateEpic).toHaveBeenCalledWith(id, input, uploads);
    expect(result).toMatchObject({ title: 'Updated Epic' });
  });

  it('should map to BadRequest for InvalidImageUrl error', async () => {
    // Given
    const id = uuidv4() as EpicId;
    vi.spyOn(EpicApp, 'updateEpic').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidImageUrl)
    );

    // When
    const call = epicResolver.Mutation!.updateEpic!(
      {},
      {
        id,
        input: { title: 'Updated', short_description: 'Updated' },
        document: [],
      },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('mutation.deleteEpic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delegate to EpicApp.deleteEpic with typed id and return deleted epic', async () => {
    // Given
    const id = uuidv4() as EpicId;
    const expected = { id, title: 'Deleted Epic' } as Epic;
    vi.spyOn(EpicApp, 'deleteEpic').mockResolvedValue(expected);

    // When
    const result = await epicResolver.Mutation!.deleteEpic!(
      {},
      { id },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    expect(EpicApp.deleteEpic).toHaveBeenCalledWith(id);
    expect(result).toMatchObject({ id });
  });

  it('should map to BadRequest for InvalidImageUrl error', async () => {
    // Given
    const id = uuidv4() as EpicId;
    vi.spyOn(EpicApp, 'deleteEpic').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidImageUrl)
    );

    // When
    const call = epicResolver.Mutation!.deleteEpic!(
      {},
      { id },
      contextSimpleUserFiligran2,
      INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});
