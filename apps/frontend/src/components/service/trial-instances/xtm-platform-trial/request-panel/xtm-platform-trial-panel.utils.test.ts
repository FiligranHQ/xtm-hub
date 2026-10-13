import {
  deriveXtmPlatformTrialPanelView,
  XtmPlatformTrialPanelView,
  XtmPlatformTrialStatusPanelState,
} from '@/components/service/trial-instances/xtm-platform-trial/request-panel/xtm-platform-trial-panel.utils';
import { DeploymentRequestHubStatus } from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('deriveXtmPlatformTrialPanelView', () => {
  it.each([
    {
      description: 'the organization is a personal space',
      isPersonalSpace: true,
      isAllowed: true,
      hubStatus: undefined,
      expected: { kind: 'personalSpace' },
    },
    {
      description: 'the user is not allowed to request a trial',
      isPersonalSpace: false,
      isAllowed: false,
      hubStatus: undefined,
      expected: { kind: 'notAllowed' },
    },
    {
      description:
        'the user is not allowed even though a bundle is in progress',
      isPersonalSpace: false,
      isAllowed: false,
      hubStatus: DeploymentRequestHubStatus.Pending,
      expected: { kind: 'notAllowed' },
    },
    {
      description: 'the user is allowed and there is no bundle',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: undefined,
      expected: { kind: 'form' },
    },
    {
      description:
        'the user is allowed and there is no bundle but the bundle hub status is null',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: null,
      expected: { kind: 'form' },
    },
    {
      description: 'the bundle is queued',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Queued,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.RequestInProgress,
        stepIndex: 0,
      },
    },
    {
      description: 'the bundle is pending',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Pending,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.RequestInProgress,
        stepIndex: 0,
      },
    },
    {
      description: 'the bundle is provisioning',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Provisioning,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.RequestInProgress,
        stepIndex: 1,
      },
    },
    {
      description: 'the bundle is cancelled',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Cancelled,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.Cancelled,
        stepIndex: undefined,
      },
    },
    {
      description: 'the bundle is expired',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Expired,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.Expired,
        stepIndex: undefined,
      },
    },
    {
      description: 'the bundle failed',
      isPersonalSpace: false,
      isAllowed: true,
      hubStatus: DeploymentRequestHubStatus.Failed,
      expected: {
        kind: 'status',
        state: XtmPlatformTrialStatusPanelState.Failed,
        stepIndex: undefined,
      },
    },
  ])(
    'should return $expected when $description',
    ({ isPersonalSpace, isAllowed, hubStatus, expected }) => {
      // Given the eligibility facts of the organization and its bundle
      // When deriving the panel view
      const view = deriveXtmPlatformTrialPanelView({
        isPersonalSpace,
        isAllowed,
        hubStatus,
      });

      // Then the expected view is selected
      expect(view).toEqual(expected as XtmPlatformTrialPanelView);
    }
  );
});
