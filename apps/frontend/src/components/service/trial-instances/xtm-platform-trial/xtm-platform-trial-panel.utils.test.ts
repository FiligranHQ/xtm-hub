import {
  deriveXtmPlatformTrialPanelState,
  XtmPlatformTrialPanelState,
} from '@/components/service/trial-instances/xtm-platform-trial/xtm-platform-trial-panel.utils';
import { PlatformIdentifier } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('deriveXtmPlatformTrialPanelState', () => {
  it.each([
    {
      description: 'the organization is a personal space',
      isPersonalSpace: true,
      isAllowed: true,
      ongoingStandaloneTrials: [],
      expected: 'personal-space',
    },
    {
      description:
        'the organization is a personal space even with ongoing trials',
      isPersonalSpace: true,
      isAllowed: true,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: 'personal-space',
    },
    {
      description: 'the user is not allowed to request a trial',
      isPersonalSpace: false,
      isAllowed: false,
      ongoingStandaloneTrials: [],
      expected: 'not-allowed',
    },
    {
      description:
        'the user is not allowed even though the organization has ongoing trials',
      isPersonalSpace: false,
      isAllowed: false,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: 'not-allowed',
    },
    {
      description:
        'the user is allowed and the organization has no ongoing trial',
      isPersonalSpace: false,
      isAllowed: true,
      ongoingStandaloneTrials: [],
      expected: 'request',
    },
    {
      description:
        'the user is allowed and the organization has one ongoing trial',
      isPersonalSpace: false,
      isAllowed: true,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: 'request-with-ongoing-trials',
    },
    {
      description:
        'the user is allowed and the organization has two ongoing trials',
      isPersonalSpace: false,
      isAllowed: true,
      ongoingStandaloneTrials: [
        PlatformIdentifier.Opencti,
        PlatformIdentifier.Openaev,
      ],
      expected: 'request-with-ongoing-trials',
    },
  ])(
    'should return $expected when $description',
    ({ isPersonalSpace, isAllowed, ongoingStandaloneTrials, expected }) => {
      // Given the eligibility facts of the organization
      // When deriving the panel state
      const state = deriveXtmPlatformTrialPanelState({
        isPersonalSpace,
        isAllowed,
        ongoingStandaloneTrials,
      });

      // Then the expected panel is selected
      expect(state).toBe(expected as XtmPlatformTrialPanelState);
    }
  );
});
