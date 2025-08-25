import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { ElasticSearchService } from './client';

// Mock the ES Client
vi.mock('@elastic/elasticsearch', () => ({
  Client: vi.fn(),
}));

interface TestDocument {
  name: string;
  value: number;
}

describe('EsClient', () => {
  describe('simpleSearch', () => {
    const esService: ElasticSearchService = new ElasticSearchService();
    let mockSearch: MockedFunction<typeof esService.search>;

    beforeEach(() => {
      mockSearch = vi.spyOn(esService, 'search') as MockedFunction<
        typeof esService.search
      >;
    });

    it('should return mapped source documents', async () => {
      const mockResponse: SearchResponse<TestDocument> = {
        took: 5,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 2, relation: 'eq' },
          max_score: 1.0,
          hits: [
            {
              _index: 'test',
              _id: '1',
              _score: 1.0,
              _source: { name: 'Doc 1', value: 100 },
            },
            {
              _index: 'test',
              _id: '2',
              _score: 1.0,
              _source: { name: 'Doc 2', value: 200 },
            },
          ],
        },
      };
      mockSearch.mockResolvedValueOnce(mockResponse);

      const result = await esService.simpleSearch<TestDocument>({
        index: 'test-index',
        size: 10,
      });

      expect(result).toEqual([
        { name: 'Doc 1', value: 100 },
        { name: 'Doc 2', value: 200 },
      ]);
    });

    it('should handle empty results', async () => {
      const emptyResponse: SearchResponse<TestDocument> = {
        took: 1,
        timed_out: false,
        _shards: { total: 1, successful: 1, skipped: 0, failed: 0 },
        hits: {
          total: { value: 0, relation: 'eq' },
          max_score: null,
          hits: [],
        },
      };
      mockSearch.mockResolvedValueOnce(emptyResponse);

      const result = await esService.simpleSearch<TestDocument>({
        index: 'test-index',
        size: 10,
      });

      expect(result).toEqual([]);
    });

    it('should propagate search errors', async () => {
      //const searchError = new Error('Elasticsearch connection failed');
      mockSearch.mockRejectedValueOnce({
        statusCode: 404,
        meta: { statusCode: 404 },
      });

      await expect(
        esService.simpleSearch<TestDocument>({
          index: 'test-index',
          size: 10,
        })
      ).rejects.toMatchObject({ statusCode: 404, meta: { statusCode: 404 } });
    });
  });
});
