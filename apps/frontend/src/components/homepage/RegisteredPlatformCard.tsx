'use client';

import { HomepageRegisteredPlatformCardViewModel } from '@/components/homepage/Homepage.utils';
import { cn } from '@/lib/utils';
import { OpenAevIconIcon, OpenCtiIconIcon } from '@filigran/icon';
import { Badge, Card, CardContent } from '@filigran/ui';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformContract } from '@graphql/generated';
import { useFormatter, useTranslations } from 'next-intl';
import React from 'react';

type RegisteredPlatformCardProps = {
  platform: HomepageRegisteredPlatformCardViewModel;
};

const PRODUCT_LABEL_BY_PRODUCT = {
  opencti: 'OpenCTI',
  openaev: 'OpenAEV',
} as const;

const CONTRACT_LABEL_BY_CONTRACT: Record<PlatformContractEnum, string> = {
  [PlatformContractEnum.CE]: 'Contracts.CE',
  [PlatformContractEnum.EE]: 'Contracts.EE',
  [PlatformContractEnum.TRIAL]: 'Contracts.TRIAL',
};

const TRIAL_DAYS_ERROR_THRESHOLD = 8;
const TRIAL_DAYS_WARNING_THRESHOLD = 22;

const resolveTrialDaysBadgeClassName = (
  remainingTrialDays: number | undefined
): string => {
  if (remainingTrialDays === undefined) {
    return 'bg-feedback-success-secondary-transparency';
  }

  if (remainingTrialDays <= TRIAL_DAYS_ERROR_THRESHOLD) {
    return 'bg-feedback-error-secondary-transparency';
  }

  if (remainingTrialDays <= TRIAL_DAYS_WARNING_THRESHOLD) {
    return 'bg-feedback-alert-secondary-transparency';
  }

  return 'bg-feedback-success-secondary-transparency';
};

const RegisteredPlatformCard = ({ platform }: RegisteredPlatformCardProps) => {
  const t = useTranslations('HomePage.RegisteredPlatformsCard');
  const format = useFormatter();

  const registrationDate = platform.registrationDate
    ? format.dateTime(new Date(platform.registrationDate), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    : '-';

  const remainingTrialDaysBadgeClassName = resolveTrialDaysBadgeClassName(
    platform.remainingTrialDays
  );
  const gradientFrom = 'hsl(var(--blue-default))';
  const gradientTo = 'hsl(var(--turquoise-300))';
  const gradientBg = 'hsl(var(--background))';
  const customStyle = {
    '--gradient-from': gradientFrom,
    '--gradient-to': gradientTo,
    '--gradient-bg': gradientBg,
  } as React.CSSProperties;

  return (
    <Card className="border pt-l my-xs bg-elevation-background-layer-1 border-elevation-border-subtle-layer-1">
      <CardContent className="p-l flex flex-col gap-m">
        <div className="flex gap-s items-center justify-between">
          <div className="flex gap-s items-center">
            <Badge className="border-none font-medium bg-feedback-info-secondary-transparency">
              <div className="flex gap-s">
                <span>
                  {platform.product === 'opencti' ? (
                    <OpenCtiIconIcon className="w-4 h-4" />
                  ) : (
                    <OpenAevIconIcon className="w-4 h-4" />
                  )}
                </span>
                <span>{PRODUCT_LABEL_BY_PRODUCT[platform.product]}</span>
              </div>
            </Badge>

            <p className="text-xs">{platform.title}</p>
          </div>
          <p className="text-xs">
            <span className="text-muted-foreground">{t('RegisteredOn')}</span>{' '}
            {registrationDate}
          </p>
        </div>
        <div className="text-sm flex gap-l items-center">
          {platform.contract === PlatformContract.Ee ? (
            <Badge
              className={cn(
                'border-2 border-transparent',
                '[background:linear-gradient(var(--gradient-bg),var(--gradient-bg))_padding-box,linear-gradient(99.95deg,var(--gradient-from)_0%,var(--gradient-to)_100%)_border-box]'
              )}
              style={customStyle}>
              <span className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent">
                {t(CONTRACT_LABEL_BY_CONTRACT[platform.contract])}
              </span>
            </Badge>
          ) : (
            <Badge className="bg-elevation-surface-highlight-layer-1 border-none">
              {t(CONTRACT_LABEL_BY_CONTRACT[platform.contract])}
            </Badge>
          )}
          {platform.contract === PlatformContract.Trial &&
            platform.remainingTrialDays !== undefined && (
              <div className="flex gap-s items-center">
                <p>{t('Remaining')}</p>
                <Badge
                  className={`border-none ${remainingTrialDaysBadgeClassName}`}>
                  {t('DaysRemaining', { days: platform.remainingTrialDays })}
                </Badge>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisteredPlatformCard;
