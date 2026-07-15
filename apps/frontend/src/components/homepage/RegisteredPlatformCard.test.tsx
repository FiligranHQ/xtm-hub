import testRender from '@/utils/test/test-render';
import { PlatformContract, PlatformIdentifier } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RegisteredPlatformCard from './RegisteredPlatformCard';

describe('RegisteredPlatformCard', () => {
  it('renders trial-specific fields when contract is a trial', () => {
    testRender(
      <RegisteredPlatformCard
        platform={{
          id: 'rp-1',
          platformIdentifier: PlatformIdentifier.Opencti,
          title: 'OpenCTI Trial',
          registrationDate: '2026-01-01T00:00:00.000Z',
          contract: PlatformContract.Trial,
          remainingTrialDays: 12,
          href: '/app/service/opencti_registration/service-instance-1',
        }}
      />
    );

    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trial')).toBeInTheDocument();
    expect(screen.getByText('DaysRemaining')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/app/service/opencti_registration/service-instance-1'
    );
  });

  it('hides trial-specific fields for non-trial contracts', () => {
    testRender(
      <RegisteredPlatformCard
        platform={{
          id: 'rp-2',
          platformIdentifier: PlatformIdentifier.Openaev,
          title: 'OpenAEV Platform',
          registrationDate: '2026-01-01T00:00:00.000Z',
          contract: PlatformContract.Ce,
          remainingTrialDays: undefined,
          href: '/app/service/openaev_registration/service-instance-2',
        }}
      />
    );

    expect(screen.getByText('OpenAEV')).toBeInTheDocument();
    expect(screen.queryByText('DaysRemaining')).toBeNull();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/app/service/openaev_registration/service-instance-2'
    );
  });

  it('renders as a plain, non-clickable card when href is undefined', () => {
    testRender(
      <RegisteredPlatformCard
        platform={{
          id: 'rp-3',
          platformIdentifier: PlatformIdentifier.Opencti,
          title: 'OpenCTI Pending Platform',
          registrationDate: '2026-01-01T00:00:00.000Z',
          contract: PlatformContract.Ce,
          remainingTrialDays: undefined,
          href: undefined,
        }}
      />
    );

    expect(screen.getByText('OpenCTI Pending Platform')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
