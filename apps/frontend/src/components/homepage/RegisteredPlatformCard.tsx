'use client';

import { HomepageRegisteredPlatformCardViewModel } from '@/components/homepage/Homepage.utils';
import { NAVIGATION_GRADIENT_STYLE } from '@/components/menu/navigation-styles';
import { OpenAevIconIcon, OpenCtiIconIcon } from '@filigran/icon';
import { Badge, Card, CardContent } from '@filigran/ui';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { useFormatter, useTranslations } from 'next-intl';

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

  const remainingTrialDaysBadgeClassName =
    platform.remainingTrialDays !== undefined &&
    platform.remainingTrialDays <= 8
      ? 'bg-feedback-error-secondary-transparency'
      : platform.remainingTrialDays !== undefined &&
          platform.remainingTrialDays <= 22
        ? 'bg-feedback-alert-secondary-transparency'
        : 'bg-feedback-success-secondary-transparency';

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
          {platform.contract === PlatformContractEnum.EE ? (
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: NAVIGATION_GRADIENT_STYLE }}>
              {t(
                CONTRACT_LABEL_BY_CONTRACT[platform.contract] ?? 'Contracts.CE'
              )}
            </span>
          ) : (
            <Badge className="bg-elevation-surface-highlight-layer-1 border-none">
              {t(
                CONTRACT_LABEL_BY_CONTRACT[platform.contract] ?? 'Contracts.CE'
              )}
            </Badge>
          )}
          {platform.contract === PlatformContractEnum.TRIAL &&
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
