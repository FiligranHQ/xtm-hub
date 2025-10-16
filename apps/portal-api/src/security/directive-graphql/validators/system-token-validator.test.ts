import config from 'config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PortalContext } from '../../../model/portal-context';
import { ForbiddenAccess } from '../../../utils/error/error.util';
import {
  SYSTEM_TOKEN_HEADER,
  validateSystemToken,
} from './system-token.validator';

// Mock the config module
vi.mock('config', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Import after mocking

describe('System Token Validation', () => {
  const MOCK_TOKEN_VALUE = 'test-system-token-xyz-789';

  beforeEach(() => {
    // Setup config mock to return our test token
    vi.mocked(config.get).mockReturnValue(MOCK_TOKEN_VALUE);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateSystemToken', () => {
    it('should return true when token is valid', () => {
      const context: PortalContext = {
        req: {
          headers: {
            [SYSTEM_TOKEN_HEADER]: MOCK_TOKEN_VALUE,
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

      expect(() => {
        validateSystemToken(context);
      }).toThrow(ForbiddenAccess('Invalid system token attempt'));
    });

    it('should throw ForbiddenAccess when token is missing', () => {
      const context: PortalContext = {
        req: {
          headers: {},
        },
      } as unknown as PortalContext;

      expect(() => {
        validateSystemToken(context);
      }).toThrow(ForbiddenAccess('Invalid system token attempt'));
    });

    it('should throw ForbiddenAccess when token is empty string', () => {
      const context: PortalContext = {
        req: {
          headers: {
            [SYSTEM_TOKEN_HEADER]: '',
          },
        },
      } as unknown as PortalContext;

      expect(() => {
        validateSystemToken(context);
      }).toThrow(ForbiddenAccess('Invalid system token attempt'));
    });
  });
});
