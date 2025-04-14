import { RESTRICTION } from '@/utils/constant';
import {
  meContext_fragment$data,
  Restriction,
} from '@generated/meContext_fragment.graphql';
import { settingsQuery$data } from '@generated/settingsQuery.graphql';
import * as React from 'react';
import { createContext, FunctionComponent } from 'react';

export interface Portal {
  me?: meContext_fragment$data | null;
  settings?: settingsQuery$data['settings'] | null;
  isPersonalSpace?: boolean;
  hasCapability?: (capability: Restriction) => boolean;
  hasOrganizationCapability?: (capability: string) => boolean;
}

export interface PortalProps extends Portal {
  children: React.ReactNode;
}

export const PortalContext = createContext<Portal>({});

export const generatePortalContext = (
  me?: meContext_fragment$data | null,
  settings?: settingsQuery$data['settings'] | null
): Portal => {
  return {
    me,
    settings,
    isPersonalSpace:
      me?.organizations?.some(
        (org) => org.personal_space && org.id === me?.selected_organization_id
      ) ?? false,
    hasCapability: (capability: Restriction) => {
      const userCapabilities = (me?.capabilities ?? []).map((c) => c?.name);
      return (
        userCapabilities.includes(RESTRICTION.CAPABILITY_BYPASS) ||
        userCapabilities.includes(capability)
      );
    },
    hasOrganizationCapability: (capability: string) => {
      return (me?.selected_org_capabilities ?? []).includes(capability);
    },
  };
};

export const AppPortalContext: FunctionComponent<PortalProps> = ({
  children,
  me,
  settings,
}) => {
  return (
    <PortalContext.Provider value={generatePortalContext(me, settings)}>
      {children}
    </PortalContext.Provider>
  );
};
