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
        }}
      />
    );

    expect(screen.getByText('OpenCTI')).toBeInTheDocument();
    expect(screen.getByText('OpenCTI Trial')).toBeInTheDocument();
    expect(screen.getByText('DaysRemaining')).toBeInTheDocument();
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
        }}
      />
    );

    expect(screen.getByText('OpenAEV')).toBeInTheDocument();
    expect(screen.queryByText('DaysRemaining')).toBeNull();
  });
});
