import { PlatformIdentifier } from '@graphql/generated';

export enum XtmPlatformTrialPanelState {
  PersonalSpace = 'personal-space',
  NotAllowed = 'not-allowed',
  Request = 'request',
  RequestWithOngoingTrials = 'request-with-ongoing-trials',
}

interface DeriveXtmPlatformTrialPanelStateParams {
  isPersonalSpace: boolean;
  isAllowed: boolean;
  ongoingStandaloneTrials: PlatformIdentifier[];
}

/**
 * Derives which panel to display on the private XTM Platform trial page.
 * The public page always shows the sign-in panel and does not use this.
 */
export const deriveXtmPlatformTrialPanelState = ({
  isPersonalSpace,
  isAllowed,
  ongoingStandaloneTrials,
}: DeriveXtmPlatformTrialPanelStateParams): XtmPlatformTrialPanelState => {
  if (isPersonalSpace) {
    return XtmPlatformTrialPanelState.PersonalSpace;
  }
  if (!isAllowed) {
    return XtmPlatformTrialPanelState.NotAllowed;
  }
  if (ongoingStandaloneTrials.length > 0) {
    return XtmPlatformTrialPanelState.RequestWithOngoingTrials;
  }
  return XtmPlatformTrialPanelState.Request;
};
