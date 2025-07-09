import { EnrollmentState } from '@/components/enroll/octi';

export const isEnrollmentPossible = (state: EnrollmentState): boolean => {
  return state.status === 'never_enrolled' && state.allowed;
};

export const isMissingCapability = (state: EnrollmentState): boolean => {
  return state.status === 'never_enrolled' && !state.allowed;
};
