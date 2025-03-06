'use client';

import { Portal, portalContext } from '@/components/me/portal-context';
import useAdminByPass from '@/hooks/useAdminByPass';
import useGranted from '@/hooks/useGranted';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext } from 'react';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction?: ORGANIZATION_CAPACITY[];
  displayError?: boolean;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction = [],
  displayError = false,
}) => {
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return null;
  }
  const isAdmin = useAdminByPass();
  const authorized = capacityRestriction.some(useGranted) || isAdmin;

  if (!authorized && displayError) {
    const t = useTranslations();
    return (
      <>
        <h2 className={'txt-title'}>{t('Utils.Error')}</h2>
        {t('Error.YouAreNotAuthorized')}
      </>
    );
  } else if (!authorized) {
    return null;
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
