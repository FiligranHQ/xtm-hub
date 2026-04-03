import { GraphQLResolveInfo } from 'graphql';
import { toGlobalId } from 'graphql-relay/node/node.js';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextBypassUser,
  TEST_ORGANIZATIONS,
} from '../../../tests/tests.const';
import {
  CanUnregisterPlatformInput,
  IsPlatformRegisteredInput,
  IsPlatformRegisteredResponse,
  PlatformContract,
  PlatformIdentifier,
  PlatformRegistrationConnectivityStatus,
  PlatformRegistrationStatus,
  RefreshPlatformRegistrationConnectivityStatusInput,
  RefreshUserPlatformTokenResponse,
  RegisteredPlatformsInput,
  RegisterPlatformInput,
  UnregisterPlatformInput,
} from '../../__generated__/resolvers-types';
import { OrganizationId } from '../../model/kanel/public/Organization';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { ErrorCode, UnknownErrorCode } from '../../utils/error/error.code';
import { DeploymentRequestDomain } from '../deployment/deployment.domain';
import { loadServiceInstanceSubscription } from '../services/service-instance.domain';
import { registrationApp } from './registration.app';
import registrationResolver from './registration.resolver';

vi.mock('../services/service-instance.domain', () => ({
  loadServiceInstanceSubscription: vi.fn(),
}));

vi.mock('../deployment/deployment.domain', () => ({
  DeploymentRequestDomain: {
    loadDeploymentRequestBy: vi.fn(),
  },
}));

const INFO = {} as GraphQLResolveInfo;

describe('Registration resolver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // RegisteredPlatform type resolvers
  // ---------------------------------------------------------------------------

  describe('RegisteredPlatform.subscription', () => {
    it('should call loadServiceInstanceSubscription with the organization id and instance id from parent', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedSubscription = {
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
      };
      vi.mocked(loadServiceInstanceSubscription).mockResolvedValue(
        expectedSubscription as never
      );

      // When
      const result = await registrationResolver.RegisteredPlatform!
        .subscription!(
        { id: serviceInstanceId } as never,
        {},
        contextBypassUser,
        INFO
      );

      // Then
      expect(loadServiceInstanceSubscription).toHaveBeenCalledWith(
        contextBypassUser.user.selected_organization_id,
        serviceInstanceId
      );
      expect(result).toEqual(expectedSubscription);
    });
  });

  describe('RegisteredPlatform.deployment_request', () => {
    it('should call DeploymentRequestDomain.loadDeploymentRequestBy with the service_instance_id from parent', async () => {
      // Given
      const serviceInstanceId = uuidv4() as ServiceInstanceId;
      const expectedRequest = {
        id: uuidv4(),
        service_instance_id: serviceInstanceId,
      };
      vi.mocked(
        DeploymentRequestDomain.loadDeploymentRequestBy
      ).mockResolvedValue(expectedRequest as never);

      // When
      const result = await registrationResolver.RegisteredPlatform!
        .deployment_request!(
        { id: serviceInstanceId } as never,
        {},
        contextBypassUser,
        INFO
      );

      // Then
      expect(
        DeploymentRequestDomain.loadDeploymentRequestBy
      ).toHaveBeenCalledWith({
        service_instance_id: serviceInstanceId,
      });
      expect(result).toEqual(expectedRequest);
    });
  });

  // ---------------------------------------------------------------------------
  // Query: isPlatformRegistered
  // ---------------------------------------------------------------------------

  describe('Query.isPlatformRegistered', () => {
    it('should return the response from registrationApp on success', async () => {
      // Given
      const input: IsPlatformRegisteredInput = { platformId: uuidv4() };
      const appResponse: IsPlatformRegisteredResponse = {
        status: PlatformRegistrationStatus.Registered,
        platformTitle: 'My Platform',
        organization: { id: TEST_ORGANIZATIONS.FILIGRAN.ID },
      };
      vi.spyOn(registrationApp, 'isPlatformRegistered').mockResolvedValue(
        appResponse
      );

      // When
      const result = await registrationResolver.Query!.isPlatformRegistered!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(registrationApp.isPlatformRegistered).toHaveBeenCalledWith(input);
      expect(result).toMatchObject({
        status: PlatformRegistrationStatus.Registered,
        platformTitle: 'My Platform',
        organization: { id: TEST_ORGANIZATIONS.FILIGRAN.ID },
      });
    });

    it('should throw a mapped GraphQL error with IsPlatformRegisteredUnknownError when the app throws', async () => {
      // Given
      const input: IsPlatformRegisteredInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'isPlatformRegistered').mockRejectedValue(
        new Error('UNEXPECTED')
      );

      // When
      const call = registrationResolver.Query!.isPlatformRegistered!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(
        UnknownErrorCode.IsPlatformRegisteredUnknownError
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Query: canUnregisterPlatform
  // ---------------------------------------------------------------------------

  describe('Query.canUnregisterPlatform', () => {
    it('should return isPlatformRegistered: true and encode organizationId as a global ID on success', async () => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      const rawOrgId = TEST_ORGANIZATIONS.FILIGRAN.ID as OrganizationId;
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockResolvedValue({
        isAllowed: true,
        isInOrganization: true,
        organizationId: rawOrgId,
      });

      // When
      const result = await registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(result).toMatchObject({
        isPlatformRegistered: true,
        isAllowed: true,
        isInOrganization: true,
        organizationId: toGlobalId('Organization', rawOrgId),
      });
    });

    it('should return isPlatformRegistered: true and organizationId: undefined when app returns no organizationId', async () => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockResolvedValue({
        isAllowed: false,
        isInOrganization: false,
        organizationId: undefined as never,
      });

      // When
      const result = await registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(result).toMatchObject({
        isPlatformRegistered: true,
        organizationId: undefined,
      });
    });

    it('should return { isPlatformRegistered: false } when the app throws PlatformNotRegistered', async () => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockRejectedValue(
        new Error(ErrorCode.PlatformNotRegistered)
      );

      // When
      const result = await registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(result).toMatchObject({ isPlatformRegistered: false });
    });

    it('should throw a mapped GraphQL error with CanUnregisterPlatformUnknownError for any other error', async () => {
      // Given
      const input: CanUnregisterPlatformInput = { platformId: uuidv4() };
      vi.spyOn(registrationApp, 'canUnregisterPlatform').mockRejectedValue(
        new Error('SOME_COMPLETELY_UNRELATED_ERROR')
      );

      // When
      const call = registrationResolver.Query!.canUnregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(
        UnknownErrorCode.CanUnregisterPlatformUnknownError
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Query: registeredPlatform
  // ---------------------------------------------------------------------------

  describe('Query.registeredPlatform', () => {
    it('should decode the service_instance_id from global ID and pass the raw UUID to registrationApp', async () => {
      // Given
      const rawId = uuidv4() as ServiceInstanceId;
      const globalId = toGlobalId('ServiceInstance', rawId);
      const expectedPlatform = { id: rawId, title: 'My Platform' };
      vi.spyOn(registrationApp, 'loadRegisteredPlatform').mockResolvedValue(
        expectedPlatform as never
      );

      // When
      const result = await registrationResolver.Query!.registeredPlatform!(
        {},
        { input: { service_instance_id: globalId } },
        contextBypassUser,
        INFO
      );

      // Then
      expect(registrationApp.loadRegisteredPlatform).toHaveBeenCalledWith(
        rawId
      );
      expect(result).toMatchObject({ id: rawId, title: 'My Platform' });
    });
  });

  // ---------------------------------------------------------------------------
  // Query: registeredPlatforms
  // ---------------------------------------------------------------------------

  describe('Query.registeredPlatforms', () => {
    it('should pass the input directly to registrationApp and return its result', async () => {
      // Given
      const input: RegisteredPlatformsInput = {
        identifier: PlatformIdentifier.Opencti,
        onlyActive: true,
        onlyTrial: false,
      };
      const platforms = [{ id: uuidv4(), title: 'Platform A' }];
      vi.spyOn(registrationApp, 'loadRegisteredPlatforms').mockResolvedValue(
        platforms as never
      );

      // When
      const result = await registrationResolver.Query!.registeredPlatforms!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(registrationApp.loadRegisteredPlatforms).toHaveBeenCalledWith(
        input
      );
      expect(result).toEqual(platforms);
    });
  });

  // ---------------------------------------------------------------------------
  // Query: platformAssociatedOrganization
  // ---------------------------------------------------------------------------

  describe('Query.platformAssociatedOrganization', () => {
    it('should return the organization returned by the app on success', async () => {
      // Given
      const platformId = uuidv4();
      const organization = {
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        name: 'Filigran',
      };
      vi.spyOn(
        registrationApp,
        'loadPlatformAssociatedOrganization'
      ).mockResolvedValue(organization as never);

      // When
      const result = await registrationResolver.Query!
        .platformAssociatedOrganization!(
        {},
        { platformId },
        contextBypassUser,
        INFO
      );

      // Then
      expect(
        registrationApp.loadPlatformAssociatedOrganization
      ).toHaveBeenCalledWith(platformId);
      expect(result).toMatchObject({
        id: TEST_ORGANIZATIONS.FILIGRAN.ID,
        name: 'Filigran',
      });
    });

    it('should return null when the platform has no associated organization', async () => {
      // Given
      const platformId = uuidv4();
      vi.spyOn(
        registrationApp,
        'loadPlatformAssociatedOrganization'
      ).mockResolvedValue(null);

      // When
      const result = await registrationResolver.Query!
        .platformAssociatedOrganization!(
        {},
        { platformId },
        contextBypassUser,
        INFO
      );

      // Then
      expect(result).toBeNull();
    });

    it('should throw a mapped GraphQL error when the app throws', async () => {
      // Given
      const platformId = uuidv4();
      vi.spyOn(
        registrationApp,
        'loadPlatformAssociatedOrganization'
      ).mockRejectedValue(new Error('USER_IS_NOT_IN_ORGANIZATION'));

      // When
      const call = registrationResolver.Query!.platformAssociatedOrganization!(
        {},
        { platformId },
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow('USER_IS_NOT_IN_ORGANIZATION');
    });
  });

  // ---------------------------------------------------------------------------
  // Mutation: registerPlatform
  // ---------------------------------------------------------------------------

  describe('Mutation.registerPlatform', () => {
    it('should decode organizationId from global ID before calling registrationApp and return the token', async () => {
      // Given
      const rawOrgId = TEST_ORGANIZATIONS.FILIGRAN.ID;
      const globalOrgId = toGlobalId('Organization', rawOrgId);
      const generatedToken = uuidv4();
      const platformInput = {
        id: uuidv4(),
        url: 'http://example.com',
        title: 'My Platform',
        contract: PlatformContract.Ee,
        version: '1.0.0',
      };
      const input: RegisterPlatformInput = {
        organizationId: globalOrgId,
        platform: platformInput,
        identifier: PlatformIdentifier.Opencti,
      };
      vi.spyOn(registrationApp, 'registerPlatform').mockResolvedValue(
        generatedToken
      );

      // When
      const result = await registrationResolver.Mutation!.registerPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(registrationApp.registerPlatform).toHaveBeenCalledWith({
        ...input,
        organizationId: rawOrgId,
      });
      expect(result).toMatchObject({ token: generatedToken });
    });

    it('should throw a mapped GraphQL error with RegisterPlatformUnknownError when the app throws', async () => {
      // Given
      const input: RegisterPlatformInput = {
        organizationId: toGlobalId(
          'Organization',
          TEST_ORGANIZATIONS.FILIGRAN.ID
        ),
        platform: {
          id: uuidv4(),
          url: 'http://example.com',
          title: 'My Platform',
          contract: PlatformContract.Ee,
          version: '1.0.0',
        },
        identifier: PlatformIdentifier.Opencti,
      };
      vi.spyOn(registrationApp, 'registerPlatform').mockRejectedValue(
        new Error('UNEXPECTED')
      );

      // When
      const call = registrationResolver.Mutation!.registerPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(
        UnknownErrorCode.RegisterPlatformUnknownError
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Mutation: unregisterPlatform
  // ---------------------------------------------------------------------------

  describe('Mutation.unregisterPlatform', () => {
    it('should call registrationApp.unregisterPlatform and return { success: true }', async () => {
      // Given
      const input: UnregisterPlatformInput = {
        platformId: uuidv4(),
        identifier: PlatformIdentifier.Opencti,
      };
      vi.spyOn(registrationApp, 'unregisterPlatform').mockResolvedValue(
        undefined
      );

      // When
      const result = await registrationResolver.Mutation!.unregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      expect(registrationApp.unregisterPlatform).toHaveBeenCalledWith(input);
      expect(result).toMatchObject({ success: true });
    });

    it('should throw a mapped GraphQL error with UnregisterPlatformUnknownError when the app throws', async () => {
      // Given
      const input: UnregisterPlatformInput = {
        platformId: uuidv4(),
        identifier: PlatformIdentifier.Opencti,
      };
      vi.spyOn(registrationApp, 'unregisterPlatform').mockRejectedValue(
        new Error('UNEXPECTED')
      );

      // When
      const call = registrationResolver.Mutation!.unregisterPlatform!(
        {},
        { input },
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(
        UnknownErrorCode.UnregisterPlatformUnknownError
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Mutation: refreshUserPlatformToken
  // ---------------------------------------------------------------------------

  describe('Mutation.refreshUserPlatformToken', () => {
    it('should call registrationApp.refreshUserPlatformToken with the context user id and return the token', async () => {
      // Given
      const newToken = uuidv4();
      const tokenResponse: RefreshUserPlatformTokenResponse = {
        token: newToken,
      };
      vi.spyOn(registrationApp, 'refreshUserPlatformToken').mockResolvedValue(
        tokenResponse
      );

      // When
      const result = await registrationResolver.Mutation!
        .refreshUserPlatformToken!({}, {}, contextBypassUser, INFO);

      // Then
      expect(registrationApp.refreshUserPlatformToken).toHaveBeenCalledWith(
        contextBypassUser.user.id
      );
      expect(result).toMatchObject({ token: newToken });
    });

    it('should throw a mapped GraphQL error with RefreshUserPlatformTokenUnknownError when the app throws', async () => {
      // Given
      vi.spyOn(registrationApp, 'refreshUserPlatformToken').mockRejectedValue(
        new Error('UNEXPECTED')
      );

      // When
      const call = registrationResolver.Mutation!.refreshUserPlatformToken!(
        {},
        {},
        contextBypassUser,
        INFO
      );

      // Then
      await expect(call).rejects.toThrow(
        UnknownErrorCode.RefreshUserPlatformTokenUnknownError
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Mutation: refreshPlatformRegistrationConnectivityStatus
  // ---------------------------------------------------------------------------

  describe('Mutation.refreshPlatformRegistrationConnectivityStatus', () => {
    it.each`
      status                                             | description
      ${PlatformRegistrationConnectivityStatus.Active}   | ${'active'}
      ${PlatformRegistrationConnectivityStatus.Inactive} | ${'inactive'}
      ${PlatformRegistrationConnectivityStatus.NotFound} | ${'not_found'}
    `(
      'should delegate to registrationApp and return status $description without transformation',
      async ({
        status,
      }: {
        status: PlatformRegistrationConnectivityStatus;
      }) => {
        // Given
        const input: RefreshPlatformRegistrationConnectivityStatusInput = {
          platformId: uuidv4(),
          token: uuidv4(),
          platformVersion: '6.0.0',
          platformIdentifier: PlatformIdentifier.Opencti,
        };
        vi.spyOn(
          registrationApp,
          'refreshPlatformRegistrationConnectivityStatus'
        ).mockResolvedValue({ status });

        // When
        const result = await registrationResolver.Mutation!
          .refreshPlatformRegistrationConnectivityStatus!(
          {},
          { input },
          contextBypassUser,
          INFO
        );

        // Then
        expect(
          registrationApp.refreshPlatformRegistrationConnectivityStatus
        ).toHaveBeenCalledWith(input);
        expect(result).toMatchObject({ status });
      }
    );
  });
});
