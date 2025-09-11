'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import useAdminByPass from '@/hooks/useAdminByPass';
import useGranted from '@/hooks/useGranted';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext } from 'react';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction?: OrganizationCapabilityEnum[];
  displayError?: boolean;
  shouldNotBePersonalSpace?: boolean;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction = [],
  displayError = false,
  shouldNotBePersonalSpace = false,
}) => {
  const { me } = useContext(PortalContext);
  if (!me) {
    return null;
  }
  const isAdmin = useAdminByPass();
  const currentOrganization = me?.organizations.find(
    (orga) => orga.id === me?.selected_organization_id
  );
  const authorized = capacityRestriction.some(useGranted) || isAdmin;

  const isPersonalSpace = currentOrganization?.personal_space ?? false;
  const t = useTranslations();

  if (!authorized || (shouldNotBePersonalSpace && isPersonalSpace)) {
    if (displayError) {
      return (
        <>
          <h2 className="txt-title">{t('Utils.Error')}</h2>
          {t('Error.YouAreNotAuthorized')}
        </>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default GuardCapacityComponent;
