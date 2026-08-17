'use client';
import {
  CampaignIcon,
  MotionPlayIcon,
  ThreatActorGroupIcon,
  VerifiedIcon,
} from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import type { ReactNode } from 'react';

import { useTranslate } from '@tolgee/react';
export interface ResourceStatusIconsProps {
  active?: boolean;
  verified?: boolean;
  deployable?: boolean;
  displayUnverifiedIcon?: boolean;
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
  displayUnverifiedIcon = false,
  iconClassName = ICON_CLASS,
}: ResourceStatusIconsProps) => {
  const { t } = useTranslate();

  if (!active && !deployable && !displayUnverifiedIcon) {
    return null;
  }

  return (
    <TooltipProvider>
      {deployable && (
        <StatusIcon
          label={t('Utils_AutomaticDeploy')}
          icon={<MotionPlayIcon className={iconClassName} />}
        />
      )}
      {verified && (
        <StatusIcon
          label={t('Service_ShareableResources_Details_SupportedByFiligran')}
          icon={<VerifiedIcon className={iconClassName} />}
        />
      )}
      {!verified && displayUnverifiedIcon && (
        <StatusIcon
          label={t('Service_ShareableResources_Details_SupportedByCommunity')}
          icon={<ThreatActorGroupIcon className={iconClassName} />}
        />
      )}
      {active && (
        <StatusIcon
          label={t('Badge_Published')}
          icon={<CampaignIcon className={iconClassName} />}
        />
      )}
    </TooltipProvider>
  );
};
