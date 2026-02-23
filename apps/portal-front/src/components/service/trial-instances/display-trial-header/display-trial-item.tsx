import { getDotColor } from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import { UseTranslationsProps } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { OpenInNewIcon } from '@filigran/icon';
import Link from 'next/link';
import { RegisteredPlatformWithDaysLeft } from './display-trial-list';

interface DisplayTrialItemProps {
  freeTrial: RegisteredPlatformWithDaysLeft;
  t: UseTranslationsProps;
}

export const DisplayTrialItem = ({ freeTrial, t }: DisplayTrialItemProps) => {
  const dotColor = getDotColor(freeTrial.daysUntilEnd);

  return (
    <Link
      className="w-full pl-m p-xs bg-page-background hover:bg-hover  flex flex-row items-center text-primary"
      aria-label={`Open ${freeTrial.title} in new tab`}
      href={freeTrial.url!}
      rel="noopener noreferrer"
      target="_blank">
      <div className={cn('w-2 h-2 rounded-full mr-s', dotColor)} />
      <span>{freeTrial.title}</span>
      <span className="p-m text-gray-300 text-sm">
        {'-'} {freeTrial.daysUntilEnd}{' '}
        {t('Service.Trials.Header.DaysRemaining')}
        {freeTrial.daysUntilEnd > 1 && <span>{'s'}</span>}
      </span>
      <OpenInNewIcon className="h-4 w-4 mr-s ml-auto" />
    </Link>
  );
};
