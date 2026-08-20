import {
  deriveXtmPlatformTrialPanelState,
  XtmPlatformTrialPanelState,
} from '@/components/service/trial-instances/xtm-platform-trial/xtm-platform-trial-panel.utils';
import { PlatformIdentifier } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('deriveXtmPlatformTrialPanelState', () => {
  it.each([
    {
      description: 'the user is not allowed to request a trial',
      isAllowed: false,
      ongoingStandaloneTrials: [],
      expected: 'not-allowed',
    },
    {
      description:
        'the user is not allowed even though the organization has ongoing trials',
      isAllowed: false,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: 'not-allowed',
    },
    {
      description:
        'the user is allowed and the organization has no ongoing trial',
      isAllowed: true,
      ongoingStandaloneTrials: [],
      expected: 'request',
    },
    {
      description:
        'the user is allowed and the organization has one ongoing trial',
      isAllowed: true,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: 'request-with-ongoing-trials',
    },
    {
      description:
        'the user is allowed and the organization has two ongoing trials',
      isAllowed: true,
      ongoingStandaloneTrials: [
        PlatformIdentifier.Opencti,
        PlatformIdentifier.Openaev,
      ],
      expected: 'request-with-ongoing-trials',
    },
  ])(
    'should return $expected when $description',
    ({ isAllowed, ongoingStandaloneTrials, expected }) => {
      // Given the eligibility facts of the organization
      // When deriving the panel state
      const state = deriveXtmPlatformTrialPanelState({
        isAllowed,
        ongoingStandaloneTrials,
      });

      // Then the expected panel is selected
      expect(state).toBe(expected as XtmPlatformTrialPanelState);
    }
  );
});
