import { PlatformInformation } from '@/components/service/registration/PlatformInformation';
import { basePlatform } from '@/components/service/registration/registered-platform.fixtures';
import testRender from '@/utils/test/test-render';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { CommercialModel } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const platform: registeredPlatformByServiceInstanceId_fragment$data = {
  ...basePlatform,
  commercial_model: CommercialModel.Other,
};

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal()),
  useFragment: () => platform,
}));

const renderInformation = () =>
  testRender(<PlatformInformation registeredPlatform={platform} />);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PlatformInformation', () => {
  it.each`
    level | title
    ${2}  | ${'Register.Details.PlatformInformation'}
    ${3}  | ${'Register.Details.RegistrationTitle'}
    ${3}  | ${'Register.Details.SubscriptionTitle'}
  `('should display the $title heading', ({ level, title }) => {
    // Given / When
    renderInformation();

    // Then
    expect(
      screen.getByRole('heading', { level, name: title })
    ).toBeInTheDocument();
  });

  it('should display the registration details of the platform', () => {
    // Given / When
    renderInformation();

    // Then
    expect(screen.getByText(platform.url)).toBeInTheDocument();
  });

  it('should display the SaaS subscription metadata of the platform', () => {
    // Given / When
    renderInformation();

    // Then
    expect(
      screen.getByText('Register.Metrics.Metadata.ReservedForSaas')
    ).toBeInTheDocument();
  });
});
