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
      'Service_Trials_Cancellation_ConfirmationForm_CancellationReasonOther'
    );
    return freeText ? `${otherLabel}: ${freeText}` : otherLabel;
  }

  // Handle plain "other" (migrated) or "Other" (new, no free text)
  if (reason.toLowerCase() === 'other') {
    return t(
      'Service_Trials_Cancellation_ConfirmationForm_CancellationReasonOther'
    );
  }

  // Standard reasons with a matching translation key
  return t(`Service_Trials_CancellationReason_${reason}`);
};
