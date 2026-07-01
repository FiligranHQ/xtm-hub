import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEpicCountFetcher, mockGetTranslations } = vi.hoisted(() => ({
  mockEpicCountFetcher: vi.fn(),
  mockGetTranslations: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();

  return {
    ...actual,
    useEpicCountPerTimelineQueryQuery: {
      fetcher: mockEpicCountFetcher,
    },
  };
});

vi.mock('next-intl/server', () => ({
  getTranslations: mockGetTranslations,
}));

import XtmRoadmap from './XtmRoadmap';

describe('XtmRoadmap', () => {
  beforeEach(() => {
    mockEpicCountFetcher.mockReset();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      (key: string, values?: { product?: string }) =>
        key === 'Title' ? `Title-${values?.product ?? 'missing'}` : key
    );
    mockEpicCountFetcher.mockReturnValue(() =>
      Promise.resolve({
        countEpicsPerTimeline: [],
      })
    );
  });

  it('uses public roadmap url by default', async () => {
    render(await XtmRoadmap({ locale: 'en' }));

    expect(screen.getByRole('link', { name: 'SeeMore' })).toHaveAttribute(
      'href',
      '/en/cybersecurity-solutions/xtm-platform-roadmap'
    );
  });

  it('uses custom roadmap href when provided', async () => {
    render(
      await XtmRoadmap({
        locale: 'en',
        seeMoreHref:
          '/app/service/xtm_platform_roadmap/instance-1?product=opencti',
      })
    );

    expect(screen.getByRole('link', { name: 'SeeMore' })).toHaveAttribute(
      'href',
      '/app/service/xtm_platform_roadmap/instance-1?product=opencti'
    );
  });

  it('uses default title key when no titleKey is provided', async () => {
    render(await XtmRoadmap({ locale: 'en' }));

    expect(
      screen.getByRole('heading', { level: 2, name: 'Title-default' })
    ).toBeInTheDocument();
  });

  it('uses custom title key when provided', async () => {
    render(
      await XtmRoadmap({
        locale: 'en',
        titleProduct: 'opencti',
      })
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Title-opencti' })
    ).toBeInTheDocument();
  });

  it('uses default title product when no titleProduct is provided', async () => {
    render(await XtmRoadmap({ locale: 'en' }));

    expect(
      screen.getByRole('heading', { level: 2, name: 'Title-default' })
    ).toBeInTheDocument();
  });

  it('uses custom title product when provided', async () => {
    render(
      await XtmRoadmap({
        locale: 'en',
        titleProduct: 'opencti',
      })
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Title-opencti' })
    ).toBeInTheDocument();
  });
});
