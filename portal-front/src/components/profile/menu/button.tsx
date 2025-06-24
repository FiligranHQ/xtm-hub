import { APP_PATH } from '@/utils/path/constant';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

interface ProfileButtonProps {
  className?: string;
}

export const ProfileMenuButton: React.FC<ProfileButtonProps> = ({
  className,
}) => {
  const t = useTranslations();

  return (
    <Link href={`/${APP_PATH}/profile`}>
      <Button
        variant="ghost"
        className={className}>
        {t('MenuUser.Profile')}
      </Button>
    </Link>
  );
};
