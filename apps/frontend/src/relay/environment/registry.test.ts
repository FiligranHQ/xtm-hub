import { Environment } from 'relay-runtime';
import { afterEach, describe, expect, it } from 'vitest';
import { getClientEnvironment, registerClientEnvironment } from './registry';

describe('registry', () => {
  afterEach(() => {
    // Reset singleton between tests
    registerClientEnvironment(null);
  });

  it('getClientEnvironment returns null initially', () => {
    expect(getClientEnvironment()).toBeNull();
  });

  it('getClientEnvironment returns the environment after registerClientEnvironment', () => {
    const mockEnv = { mock: true } as unknown as Environment;

    registerClientEnvironment(mockEnv);

    expect(getClientEnvironment()).toBe(mockEnv);
  });

  it('registerClientEnvironment overwrites a previously registered environment', () => {
    const firstEnv = { id: 'first' } as unknown as Environment;
    const secondEnv = { id: 'second' } as unknown as Environment;

    registerClientEnvironment(firstEnv);
    registerClientEnvironment(secondEnv);

    expect(getClientEnvironment()).toBe(secondEnv);
  });
});
