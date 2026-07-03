import testRender from '@/utils/test/test-render';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RegisteredPlatformCard from './RegisteredPlatformCard';

describe('RegisteredPlatformCard', () => {
  it('renders trial-specific fields and deploy CTA when deploy href is available', () => {
    testRender(
      <RegisteredPlatformCard
        platform={{
          id: 'rp-1',
          product: 'opencti',
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

  it('hides deploy CTA when deploy href is not available', () => {
    testRender(
      <RegisteredPlatformCard
        platform={{
          id: 'rp-2',
          product: 'openaev',
          title: 'OpenAEV Platform',
          registrationDate: '2026-01-01T00:00:00.000Z',
          contract: PlatformContractEnum.CE,
          remainingTrialDays: undefined,
        }}
      />
    );

    expect(screen.getByText('OpenAEV')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'DeployScenarioCta' })
    ).toBeNull();
    expect(screen.queryByText('DaysRemaining')).toBeNull();
  });
});
