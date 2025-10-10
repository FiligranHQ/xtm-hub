// lib/context.ts
import { AsyncLocalStorage } from 'async_hooks';
import { PortalContext } from './model/portal-context';
import { UserLoadUserBy } from './model/user';
import { UnknownErrorCode } from './utils/error/error.code';

export interface RequestContext {
  user: UserLoadUserBy;
  portalContext?: PortalContext;
}

// Create typed AsyncLocalStorage
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

// Get current context
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

// Get context or throw if missing
export function requireRequestContext(): RequestContext {
  const context = requestContextStorage.getStore();
  if (!context) {
    throw UnknownErrorCode.NoAsyncContextAvailableError;
  }
  return context;
}

// Update context
export function updateRequestContext(updates: Partial<RequestContext>): void {
  const store = requestContextStorage.getStore();
  Object.assign(store, updates);
}

export function setRequestContext(context: RequestContext): void {
  requestContextStorage.enterWith(context);
}

// Run with context (for middleware)
export function runWithRequestContext(
  context: RequestContext,
  callback: () => void
): void {
  requestContextStorage.run(context, callback);
}
