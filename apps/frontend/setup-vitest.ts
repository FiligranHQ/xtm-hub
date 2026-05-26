import { mswServer } from '@/utils/test/msw/server';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';

// relay-test-utils expects a global jest object internally.
// @ts-expect-error
global.jest = vi;

expect.extend(matchers);

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
