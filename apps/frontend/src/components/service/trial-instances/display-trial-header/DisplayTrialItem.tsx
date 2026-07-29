import { getDotColor } from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import { RegisteredPlatformWithDaysLeft } from '@/components/service/trial-instances/display-trial-header/DisplayTrialList';
import { UseTranslationsProps } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { OpenInNewIcon } from '@filigran/icon';
import Link from 'next/link';

interface DisplayTrialItemProps {
  freeTrial: RegisteredPlatformWithDaysLeft;
  t: UseTranslationsProps;
}

export const DisplayTrialItem = ({ freeTrial, t }: DisplayTrialItemProps) => {
  const dotColor = getDotColor(freeTrial.daysUntilEnd);
  return (
    <Link
      className="w-full pl-m p-xs bg-elevation-background-layer-1 hover:bg-hover  flex flex-row items-center text-primary"
      aria-label={t('Service.Trials.Header.OpenInNewTab', {
        title: freeTrial.title,
      })}
      href={freeTrial.url!}
      rel="noopener noreferrer"
      target="_blank">
      <div className={cn('w-2 h-2 rounded-full mr-s', dotColor)} />
      <span>{freeTrial.title}</span>
      <span className="p-m text-muted-foreground text-sm">
        {'-'}{' '}
        {t('Service.Trials.DaysRemaining', { days: freeTrial.daysUntilEnd })}
      </span>
      <OpenInNewIcon className="h-4 w-4 mr-s ml-auto" />
    </Link>
  );
};
