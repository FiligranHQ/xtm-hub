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
      expected: XtmPlatformTrialPanelState.PersonalSpace,
    },
    {
      description:
        'the organization is a personal space even with ongoing trials',
      isPersonalSpace: true,
      isAllowed: true,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: XtmPlatformTrialPanelState.PersonalSpace,
    },
    {
      description:
        'the organization is a personal space even with multiple ongoing trials',
      isPersonalSpace: true,
      isAllowed: true,
      ongoingStandaloneTrials: [
        PlatformIdentifier.Opencti,
        PlatformIdentifier.Openaev,
      ],
      expected: XtmPlatformTrialPanelState.PersonalSpace,
    },
    {
      description: 'the user is not allowed to request a trial',
      isPersonalSpace: false,
      isAllowed: false,
      ongoingStandaloneTrials: [],
      expected: XtmPlatformTrialPanelState.NotAllowed,
    },
    {
      description:
        'the user is not allowed even though the organization has ongoing trials',
      isPersonalSpace: false,
      isAllowed: false,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: XtmPlatformTrialPanelState.NotAllowed,
    },
    {
      description:
        'the user is allowed and the organization has no ongoing trial',
      isPersonalSpace: false,
      isAllowed: true,
      ongoingStandaloneTrials: [],
      expected: XtmPlatformTrialPanelState.Request,
    },
    {
      description:
        'the user is allowed and the organization has one ongoing trial',
      isPersonalSpace: false,
      isAllowed: true,
      ongoingStandaloneTrials: [PlatformIdentifier.Opencti],
      expected: XtmPlatformTrialPanelState.RequestWithOngoingTrials,
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
      expected: XtmPlatformTrialPanelState.RequestWithOngoingTrials,
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
