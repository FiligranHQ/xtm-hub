import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as dbModule from '../../../../knexfile';
import { DeploymentRequestDomain } from './deployments.domain';

describe('DeploymentRequestDomain', () => {
  describe('loadDeploymentRequestCountByRegion', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockDbUnsecure: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = {
        where: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockResolvedValue([]),
      };

      mockDbUnsecure = vi.spyOn(dbModule, 'dbUnsecure');
      mockDbUnsecure.mockReturnValue(mockQueryBuilder);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      {
        description: 'multiple regions',
        dbResults: [
          { region: 'us', count: '5' },
          { region: 'europe', count: '3' },
        ],
        expected: { us: 5, europe: 3 },
      },
      {
        description: 'empty results',
        dbResults: [],
        expected: {},
      },
      {
        description: 'zero counts',
        dbResults: [{ region: 'us', count: '0' }],
        expected: { us: 0 },
      },
    ])('should handle $description', async ({ dbResults, expected }) => {
      mockQueryBuilder.groupBy.mockResolvedValue(dbResults);

      const result =
        await DeploymentRequestDomain.loadDeploymentRequestCountByRegion({});

      expect(result).toEqual(expected);
    });
  });
});
