import testRender from '@/utils/test/test-render';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifier } from '@graphql/generated';
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
          contract: PlatformContractEnum.TRIAL,
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
          contract: PlatformContractEnum.CE,
          remainingTrialDays: undefined,
        }}
      />
    );

    expect(screen.getByText('OpenAEV')).toBeInTheDocument();
    expect(screen.queryByText('DaysRemaining')).toBeNull();
  });
});
