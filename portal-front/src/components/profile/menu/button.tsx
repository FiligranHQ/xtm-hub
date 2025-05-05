import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import * as React from 'react';

interface ProfileButtonProps {
  className?: string;
}

export const ProfileMenuButton: React.FC<ProfileButtonProps> = ({
  className,
}) => {
  const t = useTranslations();

  return (
    <Button
      variant="ghost"
      className={className}>
      <Link href="profile">{t('MenuUser.Profile')}</Link>
    </Button>
  );
};
