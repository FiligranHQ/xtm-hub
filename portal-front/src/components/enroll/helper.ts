import { enrollCanEnrollOCTIInstanceQuery$data } from '@generated/enrollCanEnrollOCTIInstanceQuery.graphql';

export const isEnrollmentPossible = (
  state: enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance']
): boolean => {
  return !!state && state.status === 'never_enrolled' && state.isAllowed;
};

export const isMissingCapability = (
  state: enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance']
): boolean => {
  return !!state && state.status === 'never_enrolled' && !state.isAllowed;
};
