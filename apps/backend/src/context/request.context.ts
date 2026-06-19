import { AsyncLocalStorage } from 'async_hooks';
import { UserLoadUserBy } from '../model/user';
import type { DocumentDataLoaders } from '../modules/document/document.dataloader';
import { UnknownErrorCode } from '../utils/error/error.code';
export interface RequestContext {
  user?: UserLoadUserBy;
  correlationId?: string;
  dataLoaders?: DocumentDataLoaders;
}

// Create typed AsyncLocalStorage
const requestContextStorage = new AsyncLocalStorage<
  RequestContext | undefined
>();

export const requestContext = {
  // Get current context
  get(): RequestContext | undefined {
    return requestContextStorage.getStore();
  },

  // Get context or throw if missing
  require(): RequestContext {
    const context = requestContextStorage.getStore();
    if (!context) {
      throw UnknownErrorCode.NoAsyncContextAvailableError;
    }
    return context;
  },

  // Get authenticated user or throw if missing
  requireUser(): UserLoadUserBy {
    const context = requestContextStorage.getStore();
    if (!context?.user) {
      throw UnknownErrorCode.NoAsyncContextAvailableError;
    }
    return context.user;
  },

  // Update context
  update(updates: Partial<RequestContext>): void {
    const context = requestContextStorage.getStore();
    if (!context) {
      throw UnknownErrorCode.NoAsyncContextAvailableError;
    }
    Object.assign(context, updates);
  },

  set(context: RequestContext | undefined): void {
    requestContextStorage.enterWith(context);
  },

  // Run with context (for middleware)
  run(context: RequestContext, callback: () => void): void {
    requestContextStorage.run(context, callback);
  },
};
