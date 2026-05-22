import {
  addDaysUntil,
  getHeaderDotColor,
} from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import { useFreeTrial } from '@/components/service/trial-instances/useFreeTrials';
import { cn } from '@/lib/utils';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { registerRegisteredPlatformFragment$data } from '@generated/registerRegisteredPlatformFragment.graphql';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DisplayTrialItem } from '@/components/service/trial-instances/display-trial-header/DisplayTrialItem';

export type RegisteredPlatformWithDaysLeft =
  registerRegisteredPlatformFragment$data & {
    daysUntilEnd: number;
  };

export const DisplayTrialList = () => {
  const t = useTranslations();
  const { freeTrials } = useFreeTrial(true);
  const freeTrialsWithDaysLeft = useMemo(
    () => addDaysUntil(freeTrials),
    [freeTrials]
  );
  const headerDotColor = getHeaderDotColor(freeTrialsWithDaysLeft);
  if (freeTrials.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-row items-center text-primary">
          <div className={cn(`w-2 h-2 rounded-full mr-s`, headerDotColor)} />
          <span>
            {freeTrials.length} {t('Service.Trials.Header.ActiveTrial')}
          </span>
          {freeTrials.length > 1 && <span>{'s'}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        {freeTrialsWithDaysLeft.map((freeTrial) => (
          <DropdownMenuItem
            className="p-0"
            key={freeTrial.id}>
            <DisplayTrialItem
              t={t}
              freeTrial={freeTrial}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
