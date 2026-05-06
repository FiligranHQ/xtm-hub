import { daysUntil } from '@/utils/date';
import { registerRegisteredPlatformFragment$data } from '@generated/registerRegisteredPlatformFragment.graphql';
import { RegisteredPlatformWithDaysLeft } from '@/components/service/trial-instances/display-trial-header/DisplayTrialList';

export const getDotColor = (daysLeft: number) => {
  if (daysLeft <= 8) return 'bg-red';
  if (daysLeft <= 22) return 'bg-yellow';
  return 'bg-green';
};

export const getHeaderDotColor = (
  freeTrials: RegisteredPlatformWithDaysLeft[]
) => {
  const minDaysLeft = Math.min(
    ...freeTrials.map((trial) => trial.daysUntilEnd)
  );
  return getDotColor(minDaysLeft);
};

export const addDaysUntil = (
  freeTrials: registerRegisteredPlatformFragment$data[]
): RegisteredPlatformWithDaysLeft[] => {
  return freeTrials.map((trial) => {
    const target = new Date(trial?.subscription?.end_date?.toString() ?? '');

    const daysUntilEnd = daysUntil(target);
    return {
      ...trial,
      daysUntilEnd,
    };
  });
};
