import { DisplayTrialItem } from '@/components/service/trial-instances/display-trial-header/display-trial-item';
import {
  addDaysUntil,
  getHeaderDotColor,
} from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import {
  FreeTrial,
  useFreeTrial,
} from '@/components/service/trial-instances/useFreeTrials';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';

export type RegisteredPlatformWithDaysLeft = FreeTrial & {
  daysUntilEnd: number;
};

export const DisplayTrialList = ({}) => {
  const t = useTranslations();
  const { freeTrials } = useFreeTrial();
  if (freeTrials.length === 0) return <></>;
  const freeTrialsWithDaysLeft = addDaysUntil(freeTrials);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex flex-row items-center text-primary">
          <div
            className={`w-2 h-2 ${getHeaderDotColor(freeTrialsWithDaysLeft)} rounded-full mr-s`}
          />
          {freeTrials.length} {t('Service.Trials.Header.ActiveTrials')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0">
        {freeTrialsWithDaysLeft.map((freeTrial) => (
          <DropdownMenuLabel
            className="p-0"
            key={freeTrial.id}>
            <DisplayTrialItem freeTrial={freeTrial} />
          </DropdownMenuLabel>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
