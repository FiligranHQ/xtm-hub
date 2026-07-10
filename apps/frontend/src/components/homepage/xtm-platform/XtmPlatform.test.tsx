import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetTranslations, mockConnectProductsButton, mockTranslate } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockConnectProductsButton: vi.fn(() => (
      <button type="button">Connect products</button>
    )),
    mockTranslate: vi.fn((key: string, values?: { name?: string }) => {
      if (key === 'LabelWithName') {
        return `t-LabelWithName-${values?.name ?? ''}`;
      }

      return `t-${key}`;
    }),
  }));

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

vi.mock('./ConnectProductsButton', () => ({
  default: mockConnectProductsButton,
}));

import XtmPlatform from './XtmPlatform';

describe('XtmPlatform', () => {
  beforeEach(() => {
    mockGetTranslations.mockReset();
    mockConnectProductsButton.mockClear();
    mockTranslate.mockClear();
    mockGetTranslations.mockResolvedValue(mockTranslate);
  });

  it('uses translated default label when welcomeName is not provided', async () => {
    render(await XtmPlatform());

    expect(screen.getByText('t-Label')).toBeTruthy();
  });

  it('uses translated interpolated label when welcomeName is provided', async () => {
    render(await XtmPlatform({ welcomeName: 'Jane Doe' }));

    expect(mockTranslate).toHaveBeenCalledWith('LabelWithName', {
      name: 'Jane Doe',
    });
    expect(screen.getByText('t-LabelWithName-Jane Doe')).toBeTruthy();
    expect(screen.queryByText('t-Label')).toBeNull();
  });
});
