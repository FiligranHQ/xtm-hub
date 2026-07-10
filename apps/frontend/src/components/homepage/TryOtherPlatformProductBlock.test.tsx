import testRender from '@/utils/test/test-render';
import { PlatformIdentifier } from '@graphql/generated';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mockUseTrialDeploymentsEligibilityQuery } = vi.hoisted(() => ({
  mockUseTrialDeploymentsEligibilityQuery: vi.fn(),
}));

vi.mock('@graphql/generated', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@graphql/generated')>();
  return {
    ...actual,
    useTrialDeploymentsEligibilityQuery: Object.assign(
      mockUseTrialDeploymentsEligibilityQuery,
      {
        getKey: (variables: unknown) => [
          'TrialDeploymentsEligibility',
          variables,
        ],
        getRootKey: () => ['TrialDeploymentsEligibility'],
      }
    ),
  };
});

vi.mock('@/lib/graphql-client', () => ({
  portalGraphqlClient: { _mock: 'portalGraphqlClient' },
}));

import TryOtherPlatformProductBlock from './TryOtherPlatformProductBlock';

describe('TryOtherPlatformProductBlock', () => {
  it.each`
    availableTrials                                             | expectedHref
    ${[PlatformIdentifier.Opencti]}                             | ${'/app/service/opencti-free-trial'}
    ${[PlatformIdentifier.Openaev]}                             | ${'/app/service/openaev-free-trial'}
    ${[PlatformIdentifier.Opencti, PlatformIdentifier.Openaev]} | ${'/app/service/opencti-free-trial'}
  `(
    'renders cross-sell block with correct trial CTA when available trials are $availableTrials',
    ({ availableTrials, expectedHref }) => {
      mockUseTrialDeploymentsEligibilityQuery.mockReturnValue({
        data: {
          trialDeployments: {
            availableTrials,
            isBlacklisted: false,
          },
        },
      });

      testRender(<TryOtherPlatformProductBlock />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Cta' })).toHaveAttribute(
        'href',
        expectedHref
      );
    }
  );

  it('renders nothing when no trial is available', () => {
    mockUseTrialDeploymentsEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          availableTrials: [],
          isBlacklisted: false,
        },
      },
    });

    const { container } = testRender(<TryOtherPlatformProductBlock />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the organization is blacklisted', () => {
    mockUseTrialDeploymentsEligibilityQuery.mockReturnValue({
      data: {
        trialDeployments: {
          availableTrials: [
            PlatformIdentifier.Opencti,
            PlatformIdentifier.Openaev,
          ],
          isBlacklisted: true,
        },
      },
    });

    const { container } = testRender(<TryOtherPlatformProductBlock />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while eligibility data is not yet available', () => {
    mockUseTrialDeploymentsEligibilityQuery.mockReturnValue({
      data: undefined,
    });

    const { container } = testRender(<TryOtherPlatformProductBlock />);

    expect(container).toBeEmptyDOMElement();
  });
});
