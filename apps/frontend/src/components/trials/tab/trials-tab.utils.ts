import {
  TRIALS_PRODUCT_ORDER,
  TRIALS_TAB_CONFIG,
  TrialsScope,
  TrialsTabType,
} from '@/components/trials/trials.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestFilter,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  TrialsProductFragment,
} from '@graphql/generated';

const SUCCESS_CLASS_NAME = 'text-feedback-success-primary';
const RUNNING_CLASS_NAME = 'text-feedback-alert-primary';
const INACTIVE_CLASS_NAME = 'text-feedback-neutral-primary';

const CLASS_NAME_BY_HUB_STATUS: Record<DeploymentRequestHubStatus, string> = {
  [DeploymentRequestHubStatus.Active]: SUCCESS_CLASS_NAME,
  [DeploymentRequestHubStatus.Pending]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Provisioning]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Queued]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Cancelled]: INACTIVE_CLASS_NAME,
  [DeploymentRequestHubStatus.Expired]: INACTIVE_CLASS_NAME,
  [DeploymentRequestHubStatus.Failed]: INACTIVE_CLASS_NAME,
};

export const resolveProductStatusClassName = (
  hubStatus: DeploymentRequestHubStatus
): string => CLASS_NAME_BY_HUB_STATUS[hubStatus];

const productRank = (product: TrialsProductFragment): number => {
  const rank = TRIALS_PRODUCT_ORDER.findIndex(
    (platformIdentifier) => platformIdentifier === product.platform_identifier
  );
  return rank === -1 ? TRIALS_PRODUCT_ORDER.length : rank;
};

export const sortProducts = (
  products: readonly TrialsProductFragment[]
): TrialsProductFragment[] =>
  [...products].sort((left, right) => productRank(left) - productRank(right));

export const buildTrialsFilters = (
  type: TrialsTabType,
  scope: TrialsScope
): DeploymentRequestFilter[] => [
  {
    key: DeploymentRequestFilterKey.Type,
    value:
      scope.kind === 'bundle'
        ? [DeploymentRequestDeploymentType.Bundle]
        : [DeploymentRequestDeploymentType.Trial],
  },
  ...(scope.kind === 'product'
    ? [
        {
          key: DeploymentRequestFilterKey.PlatformIdentifier,
          value: [scope.platformIdentifier],
        },
      ]
    : []),
  {
    key: DeploymentRequestFilterKey.HubStatus,
    value: TRIALS_TAB_CONFIG[type].statuses,
  },
];

/**
 * Format a cancellation reason for display in the trials dashboard.
 *
 * Stored values can be:
 * - A known keyword (`value`, `compatibility`, `complexity`, `legal-security`, `expertise`)
 *   → translated via `Service.Trials.CancellationReason.<keyword>`
 * - `"other"` (migrated) or `"Other"` (new, no free text)
 *   → translated via `Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther`
 * - `"Other: <free text>"` (user typed a custom reason)
 *   → translated "Other" label + `: <free text>`
 */

const OTHER_PREFIX = 'Other:';

export const formatCancellationReason = (
  reason: string,
  t: (key: string) => string
): string => {
  // Handle "Other: <free text>" format produced by SelectWithEditableField
  if (reason.startsWith(OTHER_PREFIX)) {
    const freeText = reason.slice(OTHER_PREFIX.length).trim();
    const otherLabel = t(
      'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther'
    );
    return freeText ? `${otherLabel}: ${freeText}` : otherLabel;
  }

  // Handle plain "other" (migrated) or "Other" (new, no free text)
  if (reason.toLowerCase() === 'other') {
    return t(
      'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther'
    );
  }

  // Standard reasons with a matching translation key
  return t(`Service.Trials.CancellationReason.${reason}`);
};
