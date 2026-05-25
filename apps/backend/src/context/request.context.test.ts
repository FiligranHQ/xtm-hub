// lib/Context.test.ts
import { Knex } from 'knex';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserLoadUserBy } from '../model/user';
import { UnknownErrorCode } from '../utils/error/error.code';
import { requestContext, RequestContext } from './request.context';

describe('requestContext', () => {
  const mockUser = {
    id: 1,
    last_name: 'Test User',
  } as unknown as UserLoadUserBy;
  const mockTrx = {} as Knex.Transaction;

  beforeEach(() => {
    // Restore original implementations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originals = (globalThis as any).__originalRequestContext;
    if (originals) {
      Object.assign(requestContext, originals);
    }
    requestContext.set(undefined);
  });

  describe('get()', () => {
    it('should return undefined when no context is set', async () => {
      const context = requestContext.get();
      expect(context).toBeUndefined();
    });

    it('should return the current context when set', () => {
      const testContext: RequestContext = {
        user: mockUser,
        trx: mockTrx,
      };

      requestContext.set(testContext);
      const retrievedContext = requestContext.get();

      expect(retrievedContext).toBe(testContext);
    });
  });

  describe('require()', () => {
    it('should throw error when no context is available', () => {
      expect(() => requestContext.require()).toThrow(
        UnknownErrorCode.NoAsyncContextAvailableError
      );
    });

    it('should return context when available', () => {
      const testContext: RequestContext = {
        user: mockUser,
      };

      requestContext.set(testContext);
      const retrievedContext = requestContext.require();

      expect(retrievedContext).toEqual(testContext);
    });
  });

  describe('set()', () => {
    it('should set a new context', () => {
      const testContext: RequestContext = {
        user: mockUser,
        trx: mockTrx,
      };

      requestContext.set(testContext);
      const retrievedContext = requestContext.get();

      expect(retrievedContext).toEqual(testContext);
    });

    it('should replace existing context', () => {
      const firstContext: RequestContext = {
        user: mockUser,
        trx: mockTrx,
      };

      const secondContext: RequestContext = {
        user: { id: 2, last_name: 'Second User' } as unknown as UserLoadUserBy,
      };

      requestContext.set(firstContext);
      expect(requestContext.get()).toEqual(firstContext);

      requestContext.set(secondContext);
      expect(requestContext.get()).toEqual(secondContext);
    });
  });

  describe('update()', () => {
    it('should update existing context with partial data', () => {
      const initialContext: RequestContext = {
        user: mockUser,
      };

      requestContext.set(initialContext);

      const updates = {
        trx: mockTrx,
      };

      requestContext.update(updates);
      const updatedContext = requestContext.get();
      expect(updatedContext).toBe(initialContext);
      expect(updatedContext).toStrictEqual({ ...initialContext, ...updates });
    });

    it('should overwrite existing fields when updating', () => {
      const initialContext: RequestContext = {
        user: mockUser,
        trx: mockTrx,
      };

      requestContext.set(initialContext);

      const newTrx = {
        different: 'transaction',
      } as unknown as Knex.Transaction;
      requestContext.update({ trx: newTrx });

      const updatedContext = requestContext.get();
      expect(updatedContext?.user).toBe(mockUser);
      expect(updatedContext?.trx).toBe(newTrx);
    });

    it('should handle empty updates gracefully', () => {
      const initialContext: RequestContext = {
        user: mockUser,
        trx: mockTrx,
      };

      requestContext.set(initialContext);
      requestContext.update({});

      const updatedContext = requestContext.get();
      expect(updatedContext).toStrictEqual(initialContext);
    });

    it('should throw without initial context', () => {
      // This might throw or handle gracefully depending on implementation
      // Adjust expectation based on your desired behavior
      expect(() => requestContext.update({ trx: mockTrx })).toThrow(
        UnknownErrorCode.NoAsyncContextAvailableError
      );
    });
  });

  describe('run()', () => {
    it('should execute callback with provided context', () => {
      const testContext: RequestContext = {
        user: mockUser,
      };

      let contextInsideCallback: RequestContext | undefined;
      const callback = () => {
        contextInsideCallback = requestContext.get();
      };

      requestContext.run(testContext, callback);

      expect(contextInsideCallback).toEqual(testContext);
    });

    it('should isolate context within the callback', async () => {
      const context1: RequestContext = {
        user: { id: 1, name: 'User 1' } as unknown as UserLoadUserBy,
      };

      const context2: RequestContext = {
        user: { id: 2, name: 'User 2' } as unknown as UserLoadUserBy,
      };

      // Set initial context
      requestContext.set(context1);
      expect(requestContext.get()?.user.id).toBe(1);

      // Run with different context
      await new Promise<void>((resolve) => {
        requestContext.run(context2, () => {
          expect(requestContext.get()?.user.id).toBe(2);
          resolve();
        });
      });

      // Original context should still be available outside
      expect(requestContext.get()?.user.id).toBe(1);
    });

    it('should allow nested context runs', () => {
      const outerContext: RequestContext = {
        user: { id: 1, name: 'Outer User' } as unknown as UserLoadUserBy,
      };

      const innerContext: RequestContext = {
        user: { id: 2, name: 'Inner User' } as unknown as UserLoadUserBy,
      };

      let outerResult: RequestContext | undefined;
      let innerResult: RequestContext | undefined;

      requestContext.run(outerContext, () => {
        outerResult = requestContext.get();

        requestContext.run(innerContext, () => {
          innerResult = requestContext.get();
        });

        // Should be back to outer context
        expect(requestContext.get()).toBe(outerContext);
      });

      expect(outerResult).toBe(outerContext);
      expect(innerResult).toBe(innerContext);
    });
  });

  describe('async behavior', () => {
    it('should maintain context across async operations when using run()', async () => {
      const testContext: RequestContext = {
        user: mockUser,
      };

      await new Promise<void>((resolve) => {
        requestContext.run(testContext, async () => {
          expect(requestContext.get()).toBe(testContext);

          await new Promise((resolve) => setTimeout(resolve, 10));

          expect(requestContext.get()).toBe(testContext);

          resolve();
        });
      });
    });

    it('should maintain context across Promise chains when using run()', async () => {
      const testContext: RequestContext = {
        user: mockUser,
      };

      await new Promise<void>((resolve) => {
        requestContext.run(testContext, () => {
          Promise.resolve()
            .then(() => {
              expect(requestContext.get()).toBe(testContext);
              return Promise.resolve('test');
            })
            .then(() => {
              expect(requestContext.get()).toBe(testContext);
              resolve();
            });
        });
      });
    });
  });
});
