'use client';

import { CampaignIcon, MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export interface ResourceStatusIconsProps {
  active?: boolean;
  verified?: boolean;
  deployable?: boolean;
  iconClassName?: string;
}

const ICON_CLASS = 'h-6 w-6 shrink-0 text-alert-success-primary';

interface StatusIconProps {
  label: string;
  icon: ReactNode;
}

const StatusIcon = ({ label, icon }: StatusIconProps) => (
  <Tooltip>
    <TooltipTrigger asChild>{icon}</TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

export const ResourceStatusIcons = ({
  active,
  verified,
  deployable,
  iconClassName = ICON_CLASS,
}: ResourceStatusIconsProps) => {
  const t = useTranslations();

  if (!active && !verified && !deployable) {
    return null;
  }

  return (
    <TooltipProvider>
      {deployable && (
        <StatusIcon
          label={t('Utils.AutomaticDeploy')}
          icon={<MotionPlayIcon className={iconClassName} />}
        />
      )}
      {verified && (
        <StatusIcon
          label={t('Utils.Verified')}
          icon={<VerifiedIcon className={iconClassName} />}
        />
      )}
      {active && (
        <StatusIcon
          label={t('Badge.Published')}
          icon={<CampaignIcon className={iconClassName} />}
        />
      )}
    </TooltipProvider>
  );
};
