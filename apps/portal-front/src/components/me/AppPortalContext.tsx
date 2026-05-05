import { meContext_fragment$data } from '@generated/meContext_fragment.graphql';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PortalCapabilityEnum } from '@generated/models/PortalCapability.enum';
import * as React from 'react';
import { createContext } from 'react';

export interface Portal {
  me?: meContext_fragment$data | null;
  isPersonalSpace?: boolean;
  hasCapability?: (capability: PortalCapabilityEnum) => boolean;
  hasOrganizationCapability?: (
    capability: OrganizationCapabilityEnum
  ) => boolean;
}

export interface PortalProps extends Portal {
  children: React.ReactNode;
}

export const PortalContext = createContext<Portal>({});

export const generatePortalContext = (
  me?: meContext_fragment$data | null
): Portal => {
  return {
    me,
    isPersonalSpace:
      me?.organizations?.some(
        (org) => org.personal_space && org.id === me?.selected_organization_id
      ) ?? false,
    hasCapability: (capability: PortalCapabilityEnum) => {
      const userCapabilities = (me?.capabilities ?? []).map(
        (c) => c?.name as PortalCapabilityEnum
      );
      return (
        userCapabilities.includes(PortalCapabilityEnum.BYPASS) ||
        userCapabilities.includes(capability)
      );
    },
    hasOrganizationCapability: (capability: OrganizationCapabilityEnum) => {
      return (me?.selected_org_capabilities ?? []).includes(capability);
    },
  };
};

export const AppPortalContext = ({ children, me }: PortalProps) => {
  return (
    <PortalContext.Provider value={generatePortalContext(me)}>
      {children}
    </PortalContext.Provider>
  );
};
