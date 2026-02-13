import { getDotColor } from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
import { cn } from '@/lib/utils';
import { OpenInNewIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { RegisteredPlatformWithDaysLeft } from './display-trial-list';

interface DisplayTrialItemProps {
  freeTrial: RegisteredPlatformWithDaysLeft;
}

// Component
export const DisplayTrialItem = ({ freeTrial }: DisplayTrialItemProps) => {
  const t = useTranslations();
  const dotColor = getDotColor(freeTrial.daysUntilEnd);

  return (
    <div className="pl-m p-xs bg-page-background flex flex-row items-center text-primary">
      <div className={cn('w-2 h-2 rounded-full mr-s', dotColor)} />
      <span>{freeTrial.title}</span>
      <span className="p-m text-gray-300 text-sm">
        {'-'} {freeTrial.daysUntilEnd}{' '}
        {t('Service.Trials.Header.DaysRemaining')}
      </span>
      <div className="ml-auto">
        <Link
          aria-label={`Open ${freeTrial.title} in new tab`}
          href={freeTrial.url!}
          rel="noopener noreferrer"
          target="_blank">
          <OpenInNewIcon className="h-4 w-4 mr-s" />
        </Link>
      </div>
    </div>
  );
};
