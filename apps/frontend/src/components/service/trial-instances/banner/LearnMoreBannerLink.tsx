'use client';

import { useTranslate } from '@/hooks/use-translate';
import { Button } from '@filigran/design-system';
import Link from 'next/link';
import { ComponentProps } from 'react';

type LearnMoreBannerLinkProps = Omit<ComponentProps<typeof Link>, 'children'>;

export const LearnMoreBannerLink = (props: LearnMoreBannerLinkProps) => {
  const t = useTranslate();

  return (
    <Button
      asChild
      priority="secondary"
      size="sm">
      <Link {...props}>{t('Service.Trials.LearnMore.Link')}</Link>
    </Button>
  );
};
