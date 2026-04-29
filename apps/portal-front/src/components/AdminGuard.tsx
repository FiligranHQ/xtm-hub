'use client';

import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext } from 'react';
import useGranted from '@/hooks/use-granted';
import { useAdminByPass } from '@/hooks/use-portal-capability';
import { PortalContext } from '@/components/me/AppPortalContext';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction?: OrganizationCapabilityEnum[];
  portalCapabilityRestriction?: PortalCapabilityEnum[];
  displayError?: boolean;
  shouldNotBePersonalSpace?: boolean;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction = [],
  portalCapabilityRestriction = [],
  displayError = false,
  shouldNotBePersonalSpace = false,
}) => {
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
