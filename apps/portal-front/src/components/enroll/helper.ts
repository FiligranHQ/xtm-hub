import { enrollCanEnrollOCTIInstanceFragment$data } from '@generated/enrollCanEnrollOCTIInstanceFragment.graphql';
import { CanEnrollStatusEnum } from '@generated/models/CanEnrollStatus.enum';

export const isEnrollmentPossible = (
  state: enrollCanEnrollOCTIInstanceFragment$data
): boolean => {
  return (
    !!state &&
    state.status === CanEnrollStatusEnum.NEVER_ENROLLED &&
    state.isAllowed
  );
};

export const isMissingCapability = (
  state: enrollCanEnrollOCTIInstanceFragment$data
): boolean => {
  if (!state) {
    return false;
  }

  return (
    (state.status === CanEnrollStatusEnum.NEVER_ENROLLED && !state.isAllowed) ||
    (Boolean(state.isSameOrganization) && !state.isAllowed)
  );
};
