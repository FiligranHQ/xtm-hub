import { enrollCanEnrollOCTIInstanceFragment$data } from '@generated/enrollCanEnrollOCTIInstanceFragment.graphql';

export const isEnrollmentPossible = (
  state: enrollCanEnrollOCTIInstanceFragment$data
): boolean => {
  return !!state && state.status === 'never_enrolled' && state.isAllowed;
};

export const isMissingCapability = (
  state: enrollCanEnrollOCTIInstanceFragment$data
): boolean => {
  if (!state) {
    return false;
  }

  return (
    (state.status === 'never_enrolled' && !state.isAllowed) ||
    (Boolean(state.isSameOrganization) && !state.isAllowed)
  );
};
