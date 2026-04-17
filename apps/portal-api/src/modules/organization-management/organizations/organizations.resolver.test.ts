import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserFiligran2,
  GRAPHQL_RESOLVE_INFO,
  TEST_ORGANIZATIONS,
} from '../../../../tests/tests.const';
import {
  OrderingMode,
  Organization,
  OrganizationConnection,
  OrganizationEdge,
  OrganizationInput,
  OrganizationOrdering,
  PageInfo,
} from '../../../__generated__/resolvers-types';
import { OrganizationId } from '../../../model/kanel/public/Organization';
import {
  AlreadyExistsErrorCode,
  BadRequestErrorCode,
  ForbiddenErrorCode,
} from '../../../utils/error/error.code';
import { ErrorType } from '../../../utils/error/error.type';
import { organizationsApp } from './organizations.app';
import * as organizationsDomain from './organizations.domain';
import organizationsResolver from './organizations.resolver';

describe('query.organization', () => {
  it('should load organization by id and return result', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.FILIGRAN.ID;
    const expected = { id, name: 'Filigran' } as never;
    vi.spyOn(organizationsDomain, 'loadOrganizationBy').mockResolvedValue(
      expected
    );

    // When
    const result = await organizationsResolver.Query!.organization!(
      {},
      { id },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsDomain.loadOrganizationBy).toHaveBeenCalledWith({ id });
    expect(result).toMatchObject({ id, name: 'Filigran' });
  });
});

describe('query.organizations', () => {
  it('should load all organizations with opts and return result', async () => {
    // Given
    const opts = {
      first: 10,
      orderBy: OrganizationOrdering.Name,
      orderMode: OrderingMode.Asc,
    };
    const orgId = uuidv4() as OrganizationId;
    const organization: Organization = {
      id: orgId,
      name: 'Filigran',
      personal_space: false,
    };
    const edge: OrganizationEdge = {
      cursor: orgId,
      node: organization,
    };
    const pageInfo: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: orgId,
      endCursor: orgId,
    };
    const expected: OrganizationConnection = {
      edges: [edge],
      pageInfo,
      totalCount: 1,
    };
    vi.spyOn(organizationsDomain, 'loadOrganizations').mockReturnValue(
      expected
    );

    // When
    const result = await organizationsResolver.Query!.organizations!(
      {},
      opts,
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsDomain.loadOrganizations).toHaveBeenCalledWith(opts);
    expect(result).toEqual(expected);
  });
});

describe('query.userOrganizations', () => {
  it('should load organizations by context user id and return result', async () => {
    // Given
    const expected = [
      { id: TEST_ORGANIZATIONS.FILIGRAN.ID, name: 'Filigran' },
    ] as never;
    vi.spyOn(organizationsDomain, 'loadOrganizationsByUser').mockResolvedValue(
      expected
    );

    // When
    const result = await organizationsResolver.Query!.userOrganizations!(
      {},
      {},
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsDomain.loadOrganizationsByUser).toHaveBeenCalledWith(
      contextSimpleUserFiligran2.user.id
    );
    expect(result).toEqual(expected);
  });
});

describe('mutation.addOrganization', () => {
  it('should delegate to organizationsApp.createOrganization and return created organization', async () => {
    // Given
    const input: OrganizationInput = {
      name: 'New Org',
      domains: ['new-org.com'],
    };
    const expected = {
      id: uuidv4() as OrganizationId,
      name: 'New Org',
    } as never;
    vi.spyOn(organizationsApp, 'createOrganization').mockResolvedValue(
      expected
    );

    // When
    const result = await organizationsResolver.Mutation!.addOrganization!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsApp.createOrganization).toHaveBeenCalledWith(input);
    expect(result).toMatchObject({ name: 'New Org' });
  });

  it('should map to AlreadyExists for OrganizationSameNameExists error', async () => {
    // Given
    const input: OrganizationInput = { name: 'New Org' };
    vi.spyOn(organizationsApp, 'createOrganization').mockRejectedValue(
      new Error(AlreadyExistsErrorCode.OrganizationSameNameExists)
    );

    // When
    const call = organizationsResolver.Mutation!.addOrganization!(
      {},
      { input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.AlreadyExists });
  });
});

describe('mutation.editOrganization', () => {
  it('should delegate to organizationsApp.updateOrganization with typed id and return result', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.FILIGRAN.ID;
    const input: OrganizationInput = { name: 'Updated Org' };
    const expected = { id, name: 'Updated Org' } as never;
    vi.spyOn(organizationsApp, 'updateOrganization').mockResolvedValue(
      expected
    );

    // When
    const result = await organizationsResolver.Mutation!.editOrganization!(
      {},
      { id, input },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsApp.updateOrganization).toHaveBeenCalledWith(id, input);
    expect(result).toMatchObject({ id, name: 'Updated Org' });
  });

  it('should map to BadRequest for InvalidEmail error', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.FILIGRAN.ID;
    vi.spyOn(organizationsApp, 'updateOrganization').mockRejectedValue(
      new Error(BadRequestErrorCode.InvalidEmail)
    );

    // When
    const call = organizationsResolver.Mutation!.editOrganization!(
      {},
      { id, input: { name: 'Updated Org' } },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({ name: ErrorType.BadRequest });
  });
});

describe('mutation.deleteOrganization', () => {
  it('should delegate to organizationsApp.deleteOrganization and return deleted organization', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
    const expected = { id, name: 'Deleted Org' } as never;
    vi.spyOn(organizationsApp, 'deleteOrganization').mockResolvedValue(
      expected
    );

    // When
    const result = await organizationsResolver.Mutation!.deleteOrganization!(
      {},
      { id },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    expect(organizationsApp.deleteOrganization).toHaveBeenCalledWith(id);
    expect(result).toMatchObject({ id });
  });

  it('should map to ForbiddenAccess for CantRemoveLastAdministrator error', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
    vi.spyOn(organizationsApp, 'deleteOrganization').mockRejectedValue(
      new Error(ForbiddenErrorCode.CantRemoveLastAdministrator)
    );

    // When
    const call = organizationsResolver.Mutation!.deleteOrganization!(
      {},
      { id },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      name: ErrorType.ForbiddenAccess,
    });
  });

  it('should throw StillReferencedError when error message includes STILL_IN_ORGANIZATION', async () => {
    // Given
    const id = TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID;
    vi.spyOn(organizationsApp, 'deleteOrganization').mockRejectedValue(
      new Error('STILL_IN_ORGANIZATION')
    );

    // When
    const call = organizationsResolver.Mutation!.deleteOrganization!(
      {},
      { id },
      contextSimpleUserFiligran2,
      GRAPHQL_RESOLVE_INFO
    );

    // Then
    await expect(call).rejects.toMatchObject({
      name: ErrorType.StillReference,
    });
  });
});
