'use client';
import { PortalContext } from '@/components/me/AppPortalContext';
import useGranted from '@/hooks/use-granted';
import { useAdminByPass } from '@/hooks/use-portal-capability';
import { OrganizationCapability, PortalCapability } from '@graphql/generated';
import * as React from 'react';
import { useContext } from 'react'; // Component interface

import { useTranslate } from '@tolgee/react';
// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction?: OrganizationCapability[];
  portalCapabilityRestriction?: PortalCapability[];
  displayError?: boolean;
  shouldNotBePersonalSpace?: boolean;
}

const GuardCapacityComponent = ({
  children,
  capacityRestriction = [],
  portalCapabilityRestriction = [],
  displayError = false,
  shouldNotBePersonalSpace = false,
}: GuardComponentProps) => {
  const { me, hasCapability } = useContext(PortalContext);
  if (!me || !hasCapability) {
    return null;
  }
  const isAdmin = useAdminByPass();
  const currentOrganization = me?.organizations.find(
    (orga) => orga.id === me?.selected_organization_id
  );
  const authorized =
    capacityRestriction.some(useGranted) ||
    portalCapabilityRestriction.some(hasCapability) ||
    isAdmin;

  const isPersonalSpace = currentOrganization?.personal_space ?? false;
  const { t } = useTranslate();

  if (!authorized || (shouldNotBePersonalSpace && isPersonalSpace)) {
    if (displayError) {
      return (
        <>
          <h2 className="txt-title">{t('Utils_Error')}</h2>
          {t('Error_YouAreNotAuthorized')}
        </>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default GuardCapacityComponent;
