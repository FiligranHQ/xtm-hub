import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MigrationSet } from 'migrate';
import { ElasticSearchService } from './client';
import { createEsStateStorage, StateStore } from './migration-store';

const mockWriteResponse = {
  _id: 'mock-id',
  _index: 'mock-index',
  _version: 1,
  result: 'created' as never,
  _shards: { total: 1, successful: 1, failed: 0 },
  _seq_no: 0,
  _primary_term: 1,
};

const esService = new ElasticSearchService();

const emptyState = {
  lastRun: null,
  migrations: [],
};

describe('Migration State Storage', () => {
  describe('load', () => {
    let storage: StateStore;
    beforeEach(() => {
      storage = createEsStateStorage(esService, emptyState);
    });

    it('should load existing migrations', () => {
      // Mock the search response
      vi.spyOn(esService, 'simpleSearch').mockResolvedValue([
        {
          title: '1234567890-create-users.js',
          timestamp: 1234567890,
        },
        {
          title: '1234567891-add-email.js',
          timestamp: 1234567891,
        },
      ]);

      storage.load((err, state) => {
        expect(state?.migrations).toHaveLength(2);
        expect(state?.lastRun).toBe('1234567891-add-email.js');
        expect(state?.migrations[0]?.title).toBe('1234567890-create-users.js');
      });
    });

    it('should handle elasticsearch errors', () => {
      vi.spyOn(esService, 'simpleSearch').mockRejectedValue(
        new Error('Connection failed')
      );

      storage.load((err) => {
        expect(err).toBeTruthy();
        expect(err?.message).toBe('Connection failed');
      });
    });
  });

  describe('save', () => {
    it('should save new migrations from empty index', () => {
      const esStorage = createEsStateStorage(esService, emptyState);
      // Mock index operations
      const indexSpy = vi
        .spyOn(esService, 'index')
        .mockResolvedValue(mockWriteResponse);

      const migrations = [
        {
          title: '1234567890-create-users.js',
          timestamp: 1234567890,
        },
        {
          title: '1234567891-add-email.js',
          timestamp: 1234567891,
        },
      ];

      esStorage.save(
        {
          lastRun: '1234567891-add-email.js',
          migrations,
        } as Partial<MigrationSet> as MigrationSet,
        () => {
          expect(indexSpy).toHaveBeenCalledTimes(2);
        }
      );
    });

    it('should save new migrations only', () => {
      const migrations = [
        { title: '1234567890-create-users.js', timestamp: 1234567890 },
        { title: '1234567891-add-email.js', timestamp: 1234567891 },
        { title: '1234567892-add-field.js', timestamp: 1234567892 },
      ];
      const initialState = {
        lastRun: '1234567891-add-email.js',
        migrations: [
          { title: '1234567890-create-users.js', timestamp: 1234567890 },
        ],
      };

      const esStorage = createEsStateStorage(esService, initialState);
      // Mock index operations
      const indexSpy = vi
        .spyOn(esService, 'index')
        .mockResolvedValue(mockWriteResponse);

      esStorage.save(
        {
          lastRun: '1234567891-add-email.js',
          migrations,
        } as Partial<MigrationSet> as MigrationSet,
        () => {
          expect(indexSpy).toHaveBeenCalledTimes(2);
          expect(indexSpy).toHaveBeenNthCalledWith(1, {
            index: 'migrations',
            id: '1234567891-add-email.js',
            document: {
              title: '1234567891-add-email.js',
              timestamp: 1234567891,
            },
          });
          expect(indexSpy).toHaveBeenNthCalledWith(2, {
            index: 'migrations',
            id: '1234567892-add-field.js',
            document: {
              title: '1234567892-add-field.js',
              timestamp: 1234567892,
            },
          });
        }
      );
    });

    it('should delete rolled back migrations', () => {
      const initialState = {
        lastRun: null,
        migrations: [
          { title: '1234567890-create-users.js', timestamp: 1234567890 },
          { title: '1234567891-add-email.js', timestamp: 1234567891 },
          { title: '1234567892-add-field.js', timestamp: 1234567892 },
        ],
      };

      const esStorage = createEsStateStorage(esService, initialState);

      const deleteSpy = vi
        .spyOn(esService, 'delete')
        .mockResolvedValue(mockWriteResponse);

      esStorage.save(
        {
          lastRun: '1234567891-add-email.js',
          migrations: [
            { title: '1234567890-create-users.js', timestamp: 1234567890 },
            { title: '1234567891-add-email.js', timestamp: 1234567891 },
            { title: '1234567892-add-field.js', timestamp: null },
          ],
        } as Partial<MigrationSet> as MigrationSet,
        () => {
          expect(deleteSpy).toHaveBeenCalledExactlyOnceWith({
            index: 'migrations',
            id: '1234567892-add-field.js',
          });
        }
      );
    });
  });

  describe('lock', () => {
    let storage: StateStore;
    beforeEach(() => {
      storage = createEsStateStorage(esService, emptyState);
    });

    it('return true if lock was created', async () => {
      // Mock the search response
      const createSpy = vi
        .spyOn(esService, 'create')
        .mockResolvedValue(mockWriteResponse);

      const lockSuccess = await storage.lock();

      expect(lockSuccess).toBe(true);
      expect(createSpy).toHaveBeenCalledOnce();
    });

    it('return false if lock was not created', async () => {
      const createSpy = vi.spyOn(esService, 'create').mockRejectedValue({
        statusCode: 409,
        meta: { statusCode: 409 },
      });

      const lockSuccess = await storage.lock();

      expect(lockSuccess).toBe(false);
      expect(createSpy).toHaveBeenCalledOnce();
    });
  });

  describe('unlock', () => {
    let storage: StateStore;
    beforeEach(() => {
      storage = createEsStateStorage(esService, emptyState);
    });

    it('should resolve if unlock successful', async () => {
      // Mock the search response
      const deleteSpy = vi
        .spyOn(esService, 'delete')
        .mockResolvedValue(mockWriteResponse);

      const promise = storage.unlock();

      await expect(promise).resolves.not.toThrow();
      expect(deleteSpy).toHaveBeenCalledOnce();
    });

    it('should not fail in case lock is not present anymore', async () => {
      const deleteSpy = vi.spyOn(esService, 'delete').mockRejectedValue({
        statusCode: 404,
        meta: { statusCode: 404 },
      });

      const promise = storage.unlock();

      await expect(promise).resolves.not.toThrow();
      expect(deleteSpy).toHaveBeenCalledOnce();
    });
  });
});
