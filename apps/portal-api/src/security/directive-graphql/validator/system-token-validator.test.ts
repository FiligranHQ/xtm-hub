import { describe, expect, it } from 'vitest';
import type { PortalContext } from '../../../../model/portal-context';
import {
  SYSTEM_TOKEN_HEADER,
  validateSystemToken,
} from './system-token.validator';

// Import after mocking

describe('system Token Validation', () => {
  describe('validateSystemToken', () => {
    it('should return true when token is valid', () => {
      const context: PortalContext = {
        req: {
          headers: {
            [SYSTEM_TOKEN_HEADER]: 'changeMe',
          },
        },
      } as unknown as PortalContext;

      const result = validateSystemToken(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenAccess when token is invalid', () => {
      const context: PortalContext = {
        req: {
          headers: {
            [SYSTEM_TOKEN_HEADER]: 'invalid-token',
          },
        },
      } as unknown as PortalContext;

      try {
        validateSystemToken(context);
      } catch (error) {
        expect(error.name).toBe('FORBIDDEN_ACCESS');
        expect(error.message).toBe('Invalid system token attempt');
      }
    });

    it('should throw ForbiddenAccess when token is missing', () => {
      const context: PortalContext = {
        req: {
          headers: {},
        },
      } as unknown as PortalContext;

      try {
        validateSystemToken(context);
      } catch (error) {
        expect(error.name).toBe('FORBIDDEN_ACCESS');
        expect(error.message).toBe('Invalid system token attempt');
      }
    });

    it('should throw ForbiddenAccess when token is empty string', () => {
      const context: PortalContext = {
        req: {
          headers: {
            [SYSTEM_TOKEN_HEADER]: '',
          },
        },
      } as unknown as PortalContext;

      try {
        validateSystemToken(context);
      } catch (error) {
        expect(error.name).toBe('FORBIDDEN_ACCESS');
        expect(error.message).toBe('Invalid system token attempt');
      }
    });
  });
});
