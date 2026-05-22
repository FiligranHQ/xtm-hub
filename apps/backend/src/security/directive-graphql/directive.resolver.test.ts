import { describe, expect, it, vi } from 'vitest';
import { GRAPHQL_RESOLVE_INFO } from '../../../tests/tests.const';
import { PortalContext } from '../../model/portal-context';
import { UserDomain } from '../../modules/organization-management/user/user-domain/user.domain';
import { ErrorType } from '../../utils/error/error.type';
import { createSecureFieldResolver } from './directive.resolver';

describe('createSecureFieldResolver', () => {
  describe('authentication check', () => {
    it('should throw UNAUTHENTICATED when user is not authenticated', async () => {
      const resolver = createSecureFieldResolver(vi.fn(), {
        isAuthenticatedFn: () => false,
        hasCapabilityFn: () => true,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(true),
        authDirective: {},
      });

      await expect(
        resolver(
          {},
          {},
          { user: null } as unknown as PortalContext,
          GRAPHQL_RESOLVE_INFO
        )
      ).rejects.toMatchObject({
        extensions: { code: ErrorType.Unauthenticated },
      });
    });

    it('should throw FORBIDDEN_ACCESS when user lacks capabilities', async () => {
      const resolver = createSecureFieldResolver(vi.fn(), {
        isAuthenticatedFn: () => true,
        hasCapabilityFn: () => false,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(true),
        authDirective: { portalCapa: ['BYPASS'] },
      });

      await expect(
        resolver(
          {},
          {},
          { user: { id: '1', capabilities: [] } } as unknown as PortalContext,
          GRAPHQL_RESOLVE_INFO
        )
      ).rejects.toMatchObject({ name: ErrorType.ForbiddenAccess });
    });

    it('should call the original resolver when authenticated with capabilities', async () => {
      const originalResolve = vi.fn().mockResolvedValue('result');
      const resolver = createSecureFieldResolver(originalResolve, {
        isAuthenticatedFn: () => true,
        hasCapabilityFn: () => true,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(true),
        authDirective: {},
      });

      const result = await resolver(
        {},
        {},
        { user: { id: '1', capabilities: [] } } as unknown as PortalContext,
        GRAPHQL_RESOLVE_INFO
      );

      expect(originalResolve).toHaveBeenCalledOnce();
      expect(result).toBe('result');
    });

    it('should lazily load capabilities when user.capabilities is undefined', async () => {
      const caps = [{ name: 'BYPASS' }] as unknown as Awaited<
        ReturnType<typeof UserDomain.getCapabilities>
      >;
      vi.spyOn(UserDomain, 'getCapabilities').mockResolvedValue(caps);
      const originalResolve = vi.fn().mockResolvedValue('result');
      const resolver = createSecureFieldResolver(originalResolve, {
        isAuthenticatedFn: () => true,
        hasCapabilityFn: () => true,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(true),
        authDirective: {},
      });

      await resolver(
        {},
        {},
        {
          user: { id: 'user-1', capabilities: undefined },
        } as unknown as PortalContext,
        GRAPHQL_RESOLVE_INFO
      );

      expect(UserDomain.getCapabilities).toHaveBeenCalledWith('user-1');
    });
  });

  describe('service capability check', () => {
    it('should throw FORBIDDEN_ACCESS when user lacks service capability', async () => {
      const resolver = createSecureFieldResolver(vi.fn(), {
        isAuthenticatedFn: () => true,
        hasCapabilityFn: () => true,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(false),
        serviceCapaDirective: { requires: ['UPLOAD'] },
      });

      await expect(
        resolver(
          {},
          {},
          { user: { id: '1', capabilities: [] } } as unknown as PortalContext,
          GRAPHQL_RESOLVE_INFO
        )
      ).rejects.toMatchObject({ name: ErrorType.ForbiddenAccess });
    });

    it('should call the original resolver when user has service capability', async () => {
      const originalResolve = vi.fn().mockResolvedValue('ok');
      const resolver = createSecureFieldResolver(originalResolve, {
        isAuthenticatedFn: () => true,
        hasCapabilityFn: () => true,
        hasServiceCapabilityFn: vi.fn().mockResolvedValue(true),
        serviceCapaDirective: { requires: ['UPLOAD'] },
      });

      const result = await resolver(
        {},
        {},
        { user: { id: '1', capabilities: [] } } as unknown as PortalContext,
        GRAPHQL_RESOLVE_INFO
      );

      expect(result).toBe('ok');
    });
  });
});
