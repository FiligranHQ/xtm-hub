import { getDotColor } from '@/components/service/trial-instances/display-trial-header/display-trial.utils';
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

  return (
    <div className="pl-m p-xs bg-page-background flex flex-row items-center text-primary">
      <div
        className={`w-2 h-2 ${getDotColor(freeTrial.daysUntilEnd)} rounded-full mr-s`}
      />
      {freeTrial.title}
      <p className="p-m text-gray-300 text-sm">
        {'-'} {freeTrial.daysUntilEnd} {t('Service.Trials.Header.DaysRemaning')}
      </p>
      <div className="ml-auto">
        <Link
          href={freeTrial.url!}
          rel="noopener noreferrer"
          target="_blank">
          <OpenInNewIcon className="h-4 w-4 mr-s" />
        </Link>
      </div>
    </div>
  );
};
