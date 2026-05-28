import { mswServer } from '@/utils/test/msw/server';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';

import {
  getClientEnvironment,
  registerClientEnvironment,
} from '@/relay/environment/registry';

import '@testing-library/jest-dom';

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

vi.mock('@/components/error-frontend-log.graphql', () => ({
  logFrontendError: vi.fn(),
}));

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  useParams: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('next-intl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl')>()),
  useTranslations: () => (key: string) => key,
}));

const relayRegistryMocks = vi.hoisted(() => ({
  getClientEnvironment: vi.fn(),
  registerClientEnvironment: vi.fn(),
}));

vi.mock('@/relay/environment/registry', () => relayRegistryMocks);

let mockedClientEnvironment: ReturnType<typeof getClientEnvironment> = null;
type RegisterClientEnvironment = Parameters<
  typeof registerClientEnvironment
>[0];

const setDefaultGlobalMocks = () => {
  vi.mocked(usePathname).mockReturnValue('/mock');
  vi.mocked(useRouter).mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  });
  vi.mocked(useParams).mockReturnValue({});
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>
  );
  vi.mocked(registerClientEnvironment).mockImplementation(
    (environment: RegisterClientEnvironment) => {
      mockedClientEnvironment = environment;
    }
  );
  vi.mocked(getClientEnvironment).mockImplementation(
    () => mockedClientEnvironment
  );
  registerClientEnvironment(null);
};

setDefaultGlobalMocks();

// relay-test-utils expects a global jest object internally.
// @ts-expect-error
global.jest = vi;

expect.extend(matchers);

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  vi.resetAllMocks();
  setDefaultGlobalMocks();
  cleanup();
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
