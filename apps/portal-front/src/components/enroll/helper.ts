import { enrollCanEnrollOCTIPlatformFragment$data } from '@generated/enrollCanEnrollOCTIPlatformFragment.graphql';
import { CanEnrollStatusEnum } from '@generated/models/CanEnrollStatus.enum';

export const isEnrollmentPossible = (
  state: enrollCanEnrollOCTIPlatformFragment$data
): boolean => {
  return (
    !!state &&
    state.status === CanEnrollStatusEnum.NEVER_ENROLLED &&
    state.isAllowed
  );
};

export const isMissingCapability = (
  state: enrollCanEnrollOCTIPlatformFragment$data
): boolean => {
  if (!state) {
    return false;
  }

  return (
    (state.status === CanEnrollStatusEnum.NEVER_ENROLLED && !state.isAllowed) ||
    (Boolean(state.isSameOrganization) && !state.isAllowed)
  );
};
