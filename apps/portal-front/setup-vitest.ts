import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

import '@testing-library/jest-dom';

// @ts-expect-error
global.jest = vi;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
