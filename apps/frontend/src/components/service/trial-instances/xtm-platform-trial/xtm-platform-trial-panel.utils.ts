import { PlatformIdentifier } from '@graphql/generated';

export type XtmPlatformTrialPanelState =
  'personal-space' | 'not-allowed' | 'request' | 'request-with-ongoing-trials';

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
    return 'personal-space';
  }
  if (!isAllowed) {
    return 'not-allowed';
  }
  if (ongoingStandaloneTrials.length > 0) {
    return 'request-with-ongoing-trials';
  }
  return 'request';
};
